"use server";

import prisma from "../prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";
import { handleServerErrors } from "../utils";
import { AssignmentSchema } from "../validation";
import { NotFoundError } from "@/lib/pothos/errors";
import { Prisma } from "@/lib/generated/prisma/client";
import { AssignmentFilter } from "@/lib/generated/graphql/server";

export const getAssignmentsAction = async ({
  classId,
  teacherId,
  subjectId,
  termId,
  query,
}: AssignmentFilter & { query: any }) => {
  const { currentUserId, accessLevel, schoolId } = await getCurrentUser();

  const baseWhere: Prisma.AssignmentWhereInput = {
    schoolId: schoolId!,
  };

  const roleWhere: Prisma.AssignmentWhereInput | undefined = (() => {
    if (!currentUserId || !accessLevel) return undefined;

    if (accessLevel === "teacher") {
      return {
        OR: [
          {
            classes: {
              some: {
                supervisors: { some: { clerkUserId: currentUserId } },
              },
            },
          },
          {
            subject: {
              teacherSubjectAssignments: {
                some: { teacher: { clerkUserId: currentUserId } },
              },
            },
          },
        ],
      };
    }

    if (accessLevel === "student") {
      return {
        class: {
          students: { some: { clerkUserId: currentUserId } },
        },
      };
    }

    if (accessLevel === "parent") {
      return {
        class: {
          students: {
            some: {
              parentStudents: {
                some: { parent: { clerkUserId: currentUserId } },
              },
            },
          },
        },
      };
    }

    return undefined;
  })();

  const where: Prisma.AssignmentWhereInput = {
    ...baseWhere,
    AND: [
      roleWhere,
      teacherId && {
        OR: [
          {
            classes: {
              some: {
                supervisors: { some: { clerkUserId: currentUserId } },
              },
            },
          },
          {
            subject: {
              teacherSubjectAssignments: {
                some: { teacher: { clerkUserId: currentUserId } },
              },
            },
          },
        ],
      },
    ].filter(Boolean) as Prisma.AssignmentWhereInput[],
    ...(classId && { classId }),
    ...(subjectId && { subjectId }),
    ...(termId && { termId }),
  };

  return await prisma.assignment.findMany({
    where,
    ...query,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createAssignmentAction = async ({
  files,
  ...data
}: Omit<AssignmentSchema, "id">) => {
  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.assignment.create({
      data: {
        schoolId: schoolId!,
        ...data,
        ...(files && files.length > 0 && { attachedFiles: files }),
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateAssignmentAction = async ({
  id,
  files,
  ...data
}: AssignmentSchema) => {
  if (!id) {
    throw new NotFoundError("Assignment");
  }

  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.assignment.update({
      where: {
        id,
        schoolId: schoolId!,
      },
      data: {
        ...data,
        ...(files && files.length > 0 && { attachedFiles: files }),
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteAssignmentAction = async (id: string) => {
  try {
    await prisma.assignment.delete({
      where: {
        id,
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
