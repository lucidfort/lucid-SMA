"use server";

import prisma from "../prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";
import { handleServerErrors } from "../utils";
import { ExamSchema } from "../validation";
import { NotFoundError } from "@/lib/pothos/errors";
import { Prisma } from "@/lib/generated/prisma/client";
import { ExamFilter } from "@/lib/generated/graphql/server";

export async function getExamsAction({
  gradeId,
  classId,
  teacherId,
  subjectId,
  termId,
  query,
}: ExamFilter & { query: any }) {
  const { currentUserId, accessLevel, schoolId } = await getCurrentUser();

  const baseWhere: Prisma.ExamWhereInput = {
    schoolId: schoolId!,
  };

  const roleWhere: Prisma.ExamWhereInput | undefined = (() => {
    if (!currentUserId || !accessLevel) return undefined;

    if (accessLevel === "teacher") {
      return {
        OR: [
          {
            grade: {
              classes: {
                some: {
                  supervisors: { some: { clerkUserId: currentUserId } },
                },
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

    if (accessLevel === "parent") {
      return {
        grade: {
          classes: {
            some: {
              students: {
                some: {
                  parentStudents: {
                    some: {
                      parent: {
                        clerkUserId: currentUserId,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
    }

    return undefined;
  })();

  const where: Prisma.ExamWhereInput = {
    ...baseWhere,
    AND: [
      roleWhere,
      teacherId && {
        OR: [
          {
            grade: {
              classes: {
                some: {
                  supervisors: { some: { clerkUserId: teacherId } },
                },
              },
            },
          },
          {
            subject: {
              teacherSubjectAssignments: {
                some: { teacher: { clerkUserId: teacherId } },
              },
            },
          },
        ],
      },
      classId && { grade: { classes: { some: { id: classId } } } },
    ].filter(Boolean) as Prisma.ExamWhereInput[],
    ...(gradeId && { gradeId }),
    ...(subjectId && { subjectId }),
    ...(termId && { termId }),
  };

  return await prisma.exam.findMany({
    where,
    ...query,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export const createExamAction = async ({
  files,
  ...data
}: Omit<ExamSchema, "id">) => {
  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.exam.create({
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

export const updateExamAction = async ({ id, files, ...data }: ExamSchema) => {
  if (!id) {
    throw new NotFoundError("Exam");
  }

  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.exam.update({
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

export const deleteExamAction = async (id: string) => {
  try {
    await prisma.exam.delete({
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
