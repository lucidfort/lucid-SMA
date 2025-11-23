"use server";

import {
  createUser,
  deleteUserAuthInfo,
  updateUser,
} from "@/lib/actions/school";
import { NotFoundError } from "@/lib/pothos/errors";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { deleteImage } from "../cloudinary";
import { StaffInput } from "../generated/graphql/server";
import prisma from "../prisma";
import { extractImageId, handleServerErrors } from "../utils";

interface Props
  extends Omit<StaffInput, "accessLevel" | "contractType" | "sex"> {
  slug: string;
  accessLevel:
    | "FINANCE"
    | "ACADEMICS"
    | "ADMINISTRATION"
    | "TEACHER"
    | "RESTRICTED";
  contractType: "PERMANENT" | "CONTRACT" | "PART_TIME";
  sex: "MALE" | "FEMALE";
}

export const createStaffAction = async ({
  password,
  accessLevel,
  assignments,
  slug,
  employeeId: username,
  ...data
}: Omit<Props, "id">) => {
  const { schoolId } = await getCurrentUser();

  let clerkUserId = "";

  try {
    const employeeId = `${slug}-${username}`;

    if (accessLevel !== "RESTRICTED" && password) {
      const user = await createUser({
        username: employeeId,
        password: password,
        firstName: data.name,
        lastName: data.surname,
        accessLevel: accessLevel.toLowerCase(),
        schoolId: schoolId!,
      });

      clerkUserId = user.id;
    }

    return await prisma.$transaction(async (tx) => {
      const staff = await prisma.staff.create({
        data: {
          ...data,
          schoolId: schoolId!,
          accessLevel,
          clerkUserId,
          employeeId,
        },
      });

      if (accessLevel === "TEACHER" && assignments) {
        await tx.teacherSubjectAssignment.createMany({
          data: assignments.gradeIds.map((grade) => ({
            schoolId: schoolId!,
            teacherId: staff.id,
            gradeId: grade,
            subjectId: assignments.subjectId,
          })),
        });
      }

      return staff;
    });
  } catch (e) {
    if (clerkUserId !== "") {
      await deleteUserAuthInfo(clerkUserId);
    }

    handleGraphqlServerErrors(e);
  }
};

export const updateStaffAction = async ({
  password,
  accessLevel,
  assignments,
  employeeId: username,
  slug,
  ...data
}: Props) => {
  if (!data?.id) throw new NotFoundError("Staff");

  const { schoolId } = await getCurrentUser();

  try {
    const employeeId = `${slug}-${username}`;

    await updateUser({
      username: employeeId,
      firstName: data.name,
      lastName: data.surname,
      accessLevel: accessLevel.toLowerCase(),
      clerkId: data.clerkUserId!,
      schoolId: schoolId!,
      ...(password && password !== "" ? { password } : {}),
    });

    if (data.img && data.oldImg) {
      const publicId = extractImageId(data.oldImg);

      await deleteImage(publicId.id as string);
    }

    return await prisma.$transaction(async (tx) => {
      const staff = await prisma.staff.update({
        where: {
          id: data.id!,
          schoolId,
        },
        data: {
          ...data,
          id: data.id!,
          employeeId,
        },
      });

      if (accessLevel === "TEACHER" && assignments) {
        await tx.teacherSubjectAssignment.createMany({
          data: assignments.gradeIds.map((grade) => ({
            schoolId: schoolId!,
            teacherId: staff.id,
            gradeId: grade,
            subjectId: assignments.subjectId,
          })),
        });
      }

      return staff;
    });
  } catch (err: any) {
    console.log(err);
    handleGraphqlServerErrors(err);
  }
};

export const deleteStaffAction = async (id: string) => {
  try {
    const { schoolId } = await getCurrentUser();
    const client = await clerkClient();

    await client.users.deleteUser(id);

    const teacherImg = await prisma.staff.findUnique({
      where: {
        id,
        schoolId,
      },
      select: { img: true },
    });

    if (teacherImg?.img) {
      const imageId = extractImageId(teacherImg.img);
      await deleteImage(imageId.id as string);
    }

    await prisma.staff.delete({
      where: {
        id,
        schoolId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    const serverErrors = handleServerErrors(err);

    if (serverErrors?.error) {
      return {
        success: false,
        error: serverErrors.error,
      };
    }

    return { success: false, error: true };
  }
};

export const deactivateStaff = async ({
  clerkUserId,
  staffId,
  type,
}: {
  clerkUserId: string;
  staffId: string;
  type: "activate" | "deactivate";
}) => {
  try {
    const { accessLevel, schoolId } = await getCurrentUser();
    const client = await clerkClient();

    if (accessLevel !== "manager" && accessLevel !== "administration") {
      return { success: false, error: "Unauthorized" };
    }

    if (type === "activate") {
      await client.users.unbanUser(clerkUserId);
    } else {
      await client.users.banUser(clerkUserId);
    }

    await prisma.staff.update({
      where: { id: staffId, schoolId },
      data: { isActive: type === "activate" },
    });

    revalidatePath("/list/staffs");

    return { success: true };
  } catch (err) {
    const serverErrors = handleServerErrors(err);

    if (serverErrors?.error) {
      return {
        success: false,
        error: serverErrors.error,
      };
    }

    return {
      success: false,
      error: "There seems to be an error. Please try again later",
    };
  }
};
