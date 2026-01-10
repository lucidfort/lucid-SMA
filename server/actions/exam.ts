"use server";

import prisma from "@/lib/prisma";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { NotFoundError } from "@/server/graphql/errors";
import { ExamFilter, ExamInput } from "@/lib/generated/graphql/server";
import type {
  ExamCreateArgs,
  ExamFindManyArgs,
  ExamFindUniqueArgs,
  ExamUpdateArgs,
  ExamWhereInput,
} from "@/lib/generated/prisma/models/Exam";
import { ServerActions } from "@/types";
import { resolveAcademicScopeAction } from "@/server/actions/school";

interface GetExamsProps extends ServerActions {
  filter?: ExamFilter | null;
  query: Pick<ExamFindManyArgs, "select" | "include">;
}

interface GetExamProps extends ServerActions {
  id: string;
  query: Pick<ExamFindUniqueArgs, "select" | "include">;
}

interface CreateExamProps extends ServerActions {
  input: Omit<ExamInput, "id" | "type"> & {
    type: "QUIZ" | "TEST" | "FINAL" | "MIDTERM" | "PRACTICAL";
  };
  query: Pick<ExamCreateArgs, "select" | "include">;
}

interface UpdateExamProps extends ServerActions {
  input: Omit<ExamInput, "type"> & {
    type: "QUIZ" | "TEST" | "FINAL" | "MIDTERM" | "PRACTICAL";
  };
  query: Pick<ExamUpdateArgs, "select" | "include">;
}

export async function getExamsAction({
  filter,
  query,
  context,
}: GetExamsProps) {
  const { schoolId, currentTerm } = context;
  const { gradeId, classId, teacherId, subjectId, termId } = filter ?? {};

  // Class scope takes precedence before grade
  const scope = await resolveAcademicScopeAction({ context, classId });

  if (scope === null) return [];

  const where: ExamWhereInput = {
    schoolId,
    termId: termId ?? currentTerm!,

    ...(scope.classIds?.length && {
      grade: {
        classes: { some: { id: { in: scope.classIds } } },
      },
    }),

    ...(gradeId && !classId && { gradeId }),
    ...(subjectId && { subjectId }),

    ...(teacherId && {
      OR: [
        {
          grade: {
            classes: {
              some: {
                supervisors: { some: { teacherId } },
              },
            },
          },
        },
        {
          subject: {
            teacherSubjectAssignments: {
              some: { teacherId },
            },
          },
        },
      ],
    }),
  };

  return await prisma.exam.findMany({
    where,
    ...query,
    orderBy: { createdAt: "desc" },
  });
}

export async function getExamAction({ id, query, context }: GetExamProps) {
  return await prisma.exam.findUnique({
    where: { id, schoolId: context.schoolId },
    ...query,
  });
}

export async function createExamAction({
  input,
  query,
  context,
}: CreateExamProps) {
  const { schoolId, currentTerm } = context;

  try {
    return await prisma.exam.create({
      data: {
        ...input,
        schoolId,
        termId: currentTerm!,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function updateExamAction({
  input: { id, ...input },
  query,
  context,
}: UpdateExamProps) {
  if (!id) {
    throw new NotFoundError("Exam");
  }

  const { schoolId } = context;
  try {
    return await prisma.exam.update({
      where: {
        id,
        schoolId,
      },
      data: {
        ...input,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}
