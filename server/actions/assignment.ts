"use server";

import prisma from "@/lib/prisma";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { AppError, NotFoundError } from "@/server/graphql/errors";
import {
  AssignmentFilter,
  AssignmentInput,
} from "@/lib/generated/graphql/server";
import {
  AssessmentCreateArgs,
  AssessmentFindManyArgs,
  AssessmentFindUniqueArgs,
  AssessmentUpdateArgs,
  AssessmentWhereInput,
} from "@/lib/generated/prisma/models/Assessment";
import { ServerActions } from "@/types";
import { resolveAcademicScopeAction } from "@/server/actions/school";

interface GetAssignmentsProps extends ServerActions {
  filter?: AssignmentFilter | null;
  query: Pick<AssessmentFindManyArgs, "select" | "include">;
}

interface GetAssignmentProps extends ServerActions {
  id: string;
  query: Pick<AssessmentFindUniqueArgs, "select" | "include">;
}

interface CreateAssignmentProps extends ServerActions {
  query?: Pick<AssessmentCreateArgs, "select" | "include">;
  input: Omit<AssignmentInput, "id">;
}

interface UpdateAssignmentProps extends ServerActions {
  query?: Pick<AssessmentUpdateArgs, "select" | "include">;
  input: AssignmentInput;
}

export async function getAssignmentsAction({
  query,
  filter,
  context,
}: GetAssignmentsProps) {
  const { schoolId, currentTerm } = context;
  const { classId, teacherId, subjectId, termId } = filter ?? {};

  const scope = await resolveAcademicScopeAction({ classId, context });

  if (scope === null) return [];

  const where: AssessmentWhereInput = {
    schoolId,
    termId: termId ?? currentTerm!,

    ...(scope.classIds?.length && {
      classId: { in: scope.classIds },
    }),

    ...(subjectId && { subjectId }),

    ...(teacherId && {
      OR: [
        {
          class: {
            supervisors: { some: { teacherId } },
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

  return await prisma.assessment.findMany({
    where,
    ...query,
    orderBy: { createdAt: "desc" },
  });
}

export async function getAssignmentAction({
  id,
  query,
  context,
}: GetAssignmentProps) {
  return await prisma.assessment.findUnique({
    where: { id, schoolId: context.schoolId },
    ...query,
  });
}

export async function createAssignmentAction({
  query,
  input,
  context,
}: CreateAssignmentProps) {
  const { schoolId, currentTerm } = context;

  if (!currentTerm) {
    throw new AppError("Term ID is required", "MISSING_TERM_ID");
  }

  try {
    return await prisma.assessment.create({
      data: {
        schoolId,
        ...input,
        termId: currentTerm,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function updateAssignmentAction({
  input: { id, ...input },
  query,
  context,
}: UpdateAssignmentProps) {
  if (!id) {
    throw new NotFoundError("Assignment");
  }

  const { schoolId } = context;

  try {
    return await prisma.assessment.update({
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
