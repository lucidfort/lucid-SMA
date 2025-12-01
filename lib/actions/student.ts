"use server";

import { AppError, NotFoundError } from "@/lib/pothos/errors";
import prisma from "@/lib/prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import { deleteImage } from "../cloudinary";
import { StudentInput } from "../generated/graphql/server";
import { extractImageId } from "../utils";

type GuardianRelation =
  | "FATHER"
  | "MOTHER"
  | "GUARDIAN"
  | "GRANDPARENT"
  | "SIBLING"
  | "OTHER";

interface InputProps
  extends Omit<StudentInput, "sex" | "primaryGuardian" | "secondaryGuardian"> {
  slug: string;
  sex: "MALE" | "FEMALE";
  primaryGuardian: {
    id: string;
    relation: GuardianRelation;
  };
  secondaryGuardian?: {
    id: string;
    relation: GuardianRelation;
  } | null;
}

const checkClassAvailability = async (classId: string, schoolId: string) => {
  const classItem = await prisma.class.findUnique({
    where: { id: classId, schoolId: schoolId },
    select: { capacity: true, _count: { select: { students: true } } },
  });

  if (classItem && classItem.capacity === classItem._count.students) {
    throw new AppError("There's no space in this class", "CLASS_OCCUPIED");
  }

  return;
};

export const createStudentAction = async (data: Omit<InputProps, "id">) => {
  const { schoolId } = await getCurrentUser();

  try {
    await checkClassAvailability(data.classId, schoolId!);

    const {
      primaryGuardian,
      secondaryGuardian,
      registrationNumber: regNo,
      slug,
      ...input
    } = data;

    const registrationNumber = `${slug}-${regNo}`;

    return await prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          schoolId: schoolId!,
          ...input,
          registrationNumber,
        },
      });

      const guardians = [
        {
          parentId: primaryGuardian.id,
          studentId: student.id,
          relation: primaryGuardian.relation,
          isPrimary: true,
        },
        ...(secondaryGuardian
          ? [
              {
                parentId: secondaryGuardian.id,
                studentId: student.id,
                relation: secondaryGuardian.relation!,
                isPrimary: false,
              },
            ]
          : []),
      ];

      await tx.parentStudent.createMany({
        data: guardians,
      });

      return student;
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateStudentAction = async (data: InputProps) => {
  if (!data.id) {
    throw new NotFoundError("Student");
  }

  try {
    const { schoolId } = await getCurrentUser();

    await checkClassAvailability(data.classId, schoolId!);

    const {
      id: studentId,
      primaryGuardian,
      secondaryGuardian,
      registrationNumber: regNo,
      oldImg,
      img,
      slug,
      ...input
    } = data;

    // Delete an old image if a new one was uploaded
    if (img && oldImg) {
      const publicId = extractImageId(oldImg);
      await deleteImage(publicId.id as string);
    }

    const registrationNumber = `${slug}-${regNo}`;

    const guardianOps = [
      {
        where: {
          parentId_studentId: {
            parentId: primaryGuardian.id,
            studentId: studentId!,
          },
        },
        create: {
          parentId: primaryGuardian.id,
          relation: primaryGuardian.relation,
          isPrimary: true,
        },
        update: {
          relation: primaryGuardian.relation,
          isPrimary: true,
        },
      },
      ...(secondaryGuardian
        ? [
            {
              where: {
                parentId_studentId: {
                  parentId: secondaryGuardian.id,
                  studentId: studentId!,
                },
              },
              create: {
                parentId: secondaryGuardian.id,
                relation: secondaryGuardian.relation!,
                isPrimary: false,
              },
              update: {
                relation: secondaryGuardian.relation,
                isPrimary: false,
              },
            },
          ]
        : []),
    ];

    // Remove any guardians that are no longer in the list
    const validGuardianIds = [
      primaryGuardian.id,
      ...(secondaryGuardian ? [secondaryGuardian.id] : []),
    ];

    return await prisma.student.update({
      where: {
        id: studentId!,
        schoolId,
      },
      data: {
        ...input,
        img,
        registrationNumber,
        parentStudents: {
          deleteMany: {
            parentId: { notIn: validGuardianIds },
          },
          upsert: guardianOps,
        },
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteStudentAction = async (studentId: string) => {
  try {
    const { accessLevel, schoolId } = await getCurrentUser();

    if (accessLevel !== "manager") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.$transaction(async (tx) => {
      const parentLinks = await tx.parentStudent.findMany({
        where: { studentId },
        select: { parentId: true },
      });

      const parentIds = parentLinks.map((p) => p.parentId);

      await tx.student.delete({
        where: {
          id: studentId,
          schoolId,
        },
      });

      if (parentIds.length > 0) {
        await tx.parent.deleteMany({
          where: {
            id: {
              in: parentIds,
            },
            parentStudents: { none: {} },
          },
        });
      }
    });

    const studentImg = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
      select: { img: true },
    });

    if (studentImg?.img) {
      const imageId = extractImageId(studentImg.img);
      await deleteImage(imageId.id as string);
    }

    return { success: true, error: "" };
  } catch (err: any) {
    console.log(err);
    handleGraphqlServerErrors(err);
  }
};
