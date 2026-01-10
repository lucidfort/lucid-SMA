"use server";

import {
  createUserAuth,
  deleteUserAuth,
  updateUserAuth,
} from "@/server/actions/school";
import { AppError } from "@/server/graphql/errors";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { clerkClient } from "@clerk/nextjs/server";
import { deleteImage } from "@/lib/cloudinary";
import { StaffFilter, StaffInput } from "@/lib/generated/graphql/server";
import prisma from "@/lib/prisma";
import { extractImageId } from "@/lib/utils/client.utils";
import { ServerActions } from "@/types";
import {
  StaffCreateArgs,
  StaffFindFirstArgs,
  StaffFindManyArgs,
  StaffUpdateArgs,
  StaffWhereInput,
} from "@/lib/generated/prisma/models/Staff";
import { ClassSupervisorCreateArgs } from "@/lib/generated/prisma/models/ClassSupervisor";
import { TeacherSubjectAssignmentCreateArgs } from "@/lib/generated/prisma/models/TeacherSubjectAssignment";

interface StaffInputType
  extends Omit<StaffInput, "accessLevel" | "contractType" | "sex"> {
  accessLevel:
    | "FINANCE"
    | "ACADEMICS"
    | "ADMINISTRATION"
    | "TEACHER"
    | "RESTRICTED";
  contractType: "PERMANENT" | "CONTRACT" | "PART_TIME";
  sex: "MALE" | "FEMALE";
}

interface GetStaffsProps extends ServerActions {
  filter?:
    | (Omit<StaffFilter, "accessLevel"> & {
        accessLevel?:
          | "FINANCE"
          | "ACADEMICS"
          | "ADMINISTRATION"
          | "TEACHER"
          | "RESTRICTED"
          | null;
      })
    | null;
  query?: Pick<StaffFindManyArgs, "select" | "include">;
}

interface GetStaffProps extends ServerActions {
  filter: {
    id?: string | null;
    clerkUserId?: string | null;
  };
  query?: Pick<StaffFindFirstArgs, "select" | "include">;
}

interface CreateStaffProps extends ServerActions {
  input: Omit<StaffInputType, "id">;
  query?: Pick<StaffCreateArgs, "select" | "include">;
}

interface UpdateStaffProps extends ServerActions {
  input: StaffInputType;
  query?: Pick<StaffUpdateArgs, "select" | "include">;
}

interface UpdateStaffStatusProps extends ServerActions {
  clerkUserId?: string | null;
  staffId: string;
  activate: boolean;
}

interface AssignSubjectProps extends ServerActions {
  subjectId: string;
  staffId: string;
  grades: string[];
  query: Pick<TeacherSubjectAssignmentCreateArgs, "select" | "include">;
}

interface AssignClassProps extends ServerActions {
  staffId: string;
  classId: string;
  query: Pick<ClassSupervisorCreateArgs, "select" | "include">;
}

export async function getStaffScope({ context }: ServerActions) {
  const { userId, schoolId } = context;

  const rows = await prisma.classSupervisor.findMany({
    where: {
      teacher: { schoolId, clerkUserId: userId },
      class: { schoolId, isActive: true },
    },
    select: {
      classId: true,
      class: {
        select: { gradeId: true },
      },
    },
  });

  const classIds = new Set<string>();
  const gradeIds = new Set<string>();

  for (const row of rows) {
    classIds.add(row.classId);
    gradeIds.add(row.class.gradeId);
  }

  return {
    classIds: [...classIds],
    gradeIds: [...gradeIds],
  };
}

export async function getStaffsAction({
  filter,
  query,
  context,
}: GetStaffsProps) {
  const { isActive, accessLevel, classId, searchTerm } = filter ?? {};
  const { schoolId } = context;

  return prisma.staff.findMany({
    where: {
      schoolId,
      isActive,
      ...(classId && { classes: { some: { classId } } }),
      ...(accessLevel && { accessLevel }),
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { surname: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    },
    ...query,
  });
}

export async function getStaffAction({
  filter,
  query,
  context,
}: GetStaffProps) {
  const { schoolId } = context;
  const { id, clerkUserId } = filter;

  if (!id && !clerkUserId) {
    throw new AppError(
      "Staff ID or Clerk User ID is required",
      "MISSING_REQUIRED_PARAMS",
    );
  }

  let where: StaffWhereInput;

  if (id) {
    where = { id };
  } else {
    where = { clerkUserId };
  }

  return prisma.staff.findFirst({
    where: {
      schoolId,
      ...where,
    },
    ...query,
  });
}

export async function createStaffAction({
  input: data,
  query,
  context,
}: CreateStaffProps) {
  const { schoolId, slug } = context;

  if (!slug) {
    throw new AppError(
      "School's slug was not found. Please refresh or log in",
      "MISSING_SLUG",
    );
  }

  let clerkUserId = "";

  const { password, accessLevel, employeeId: username, ...input } = data;

  const employeeId = `${slug}_s${username}`;

  try {
    if (accessLevel !== "RESTRICTED" && password) {
      const user = await createUserAuth({
        ...data,
        username: employeeId,
        password,
        schoolId,
        accessLevel: accessLevel.toLowerCase(),
      });

      clerkUserId = user.id;
    }

    return await prisma.staff.create({
      data: {
        ...input,
        schoolId,
        accessLevel,
        clerkUserId,
        employeeId,
      },
      ...query,
    });
  } catch (e) {
    if (clerkUserId !== "") {
      await deleteUserAuth(clerkUserId);
    }

    await handleGraphqlServerErrors(e);
  }
}

export async function updateStaffAction({
  input: data,
  query,
  context,
}: UpdateStaffProps) {
  const {
    id,
    password,
    accessLevel,
    clerkUserId,
    employeeId: username,
    oldImg,
    ...input
  } = data;

  if (!id) throw new AppError("Staff ID is required", "MISSING_STAFF_ID");

  const { schoolId, slug } = context;

  if (!slug) {
    throw new AppError(
      "School's slug was not found. Please refresh or log in",
      "MISSING_SLUG",
    );
  }

  const employeeId = `${slug}_s${username}`;

  try {
    if (clerkUserId) {
      await updateUserAuth({
        ...input,
        schoolId,
        userClerkId: clerkUserId,
        username: employeeId,
        accessLevel: accessLevel.toLowerCase(),
        ...(password && password !== "" ? { password } : {}),
      });
    }

    if (input.img && oldImg) {
      const publicId = extractImageId(oldImg);

      await deleteImage(publicId.id as string);
    }

    return await prisma.staff.update({
      where: {
        id,
        schoolId,
      },
      data: {
        ...input,
        employeeId,
        accessLevel,
      },
      ...query,
    });
  } catch (err: any) {
    console.log(err);
    await handleGraphqlServerErrors(err);
  }
}

export async function deactivateStaffAction({
  staffId,
  clerkUserId,
  activate,
  context,
}: UpdateStaffStatusProps) {
  const { schoolId } = context;
  const client = await clerkClient();

  try {
    if (clerkUserId) {
      if (activate) {
        await client.users.unbanUser(clerkUserId);
      } else {
        await client.users.banUser(clerkUserId);
      }
    }

    const staff = await prisma.staff.update({
      where: { id: staffId, schoolId },
      data: { isActive: activate },
      select: { id: true },
    });

    return !(!staff || staff.id);
  } catch (err) {
    await handleGraphqlServerErrors(err);
  }
}

export async function assignSubjectAction({
  grades,
  staffId,
  subjectId,
  query,
  context,
}: AssignSubjectProps) {
  const { schoolId } = context;

  try {
    return await prisma.$transaction(
      grades.map((grade) =>
        prisma.teacherSubjectAssignment.create({
          data: {
            schoolId,
            subjectId,
            teacherId: staffId,
            grades: { connect: { id: grade } },
          },
          ...query,
        }),
      ),
    );
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
}

export const assignClassAction = async ({
  staffId,
  classId,
  query,
  context,
}: AssignClassProps) => {
  const { schoolId } = context;

  try {
    const classResponse = await prisma.class.findUnique({
      where: { id: classId },
      select: { schoolId: true },
    });

    const staffResponse = await prisma.staff.findUnique({
      where: { id: staffId },
      select: { schoolId: true },
    });

    if (
      !classResponse ||
      !staffResponse ||
      classResponse.schoolId !== staffResponse.schoolId ||
      classResponse.schoolId !== schoolId ||
      staffResponse.schoolId !== schoolId
    ) {
      throw new AppError(
        "Couldn't match the records. Please try again later",
        "SCHOOLID_MISMATCH",
      );
    }

    return await prisma.classSupervisor.create({
      data: {
        classId,
        teacherId: staffId,
      },
      ...query,
    });
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
};
