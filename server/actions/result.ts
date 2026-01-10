"use server";

import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import prisma from "@/lib/prisma";
import { ResultFilter, ResultInput } from "@/lib/generated/graphql/server";
import { NotFoundError } from "@/server/graphql/errors";
import {
  ExamResultCreateArgs,
  ExamResultFindManyArgs,
  ExamResultUpdateArgs,
  ExamResultWhereInput,
} from "@/lib/generated/prisma/models/ExamResult";
import { ServerActions } from "@/types";
import {
  AssessmentResultCreateArgs,
  AssessmentResultFindManyArgs,
  AssessmentResultUpdateArgs,
  AssessmentResultWhereInput,
} from "@/lib/generated/prisma/models/AssessmentResult";
import { resolveAcademicScopeAction } from "@/server/actions/school";

interface GetAssessmentResultsProps extends ServerActions {
  filter: ResultFilter;
  query?: Pick<AssessmentResultFindManyArgs, "select" | "include">;
}

interface GetExamResultsProps extends ServerActions {
  filter: ResultFilter;
  query?: Pick<ExamResultFindManyArgs, "select" | "include">;
}

interface CreateAssessmentResultProps extends ServerActions {
  input: Omit<ResultInput, "id">;
  query?: Pick<AssessmentResultCreateArgs, "select" | "include">;
}

interface UpdateAssessmentResultProps extends ServerActions {
  input: ResultInput;
  query?: Pick<AssessmentResultUpdateArgs, "select" | "include">;
}

interface CreateExamResultProps extends ServerActions {
  input: Omit<ResultInput, "id">;
  query?: Pick<ExamResultCreateArgs, "select" | "include">;
}

interface UpdateExamResultProps extends ServerActions {
  input: ResultInput;
  query?: Pick<ExamResultUpdateArgs, "select" | "include">;
}

export async function getAssessmentResultsAction({
  filter,
  query,
  context,
}: GetAssessmentResultsProps) {
  const { schoolId, currentTerm } = context;
  const { studentId, classId, testId, termId } = filter;

  const scope = await resolveAcademicScopeAction({
    classId,
    studentId,
    context,
  });

  if (scope === null) return [];

  const where: AssessmentResultWhereInput = {
    schoolId,
    assignment: {
      termId: termId ?? currentTerm!,
    },

    ...(scope.classIds?.length && {
      student: { classId: { in: scope.classIds } },
    }),

    ...(scope.studentIds?.length && {
      studentId: { in: scope.studentIds },
    }),

    ...(testId && { assignmentId: testId }),
  };

  return await prisma.assessmentResult.findMany({
    where,
    ...query,
    orderBy: { uploadedAt: "desc" },
  });
}

export async function createAssessmentResultAction({
  input: { testId, score, studentId },
  query,
  context,
}: CreateAssessmentResultProps) {
  const { schoolId } = context;

  try {
    return await prisma.assessmentResult.create({
      data: {
        schoolId,
        studentId,
        assignmentId: testId,
        score,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function updateAssessmentResultAction({
  input,
  query,
  context,
}: UpdateAssessmentResultProps) {
  if (!input.id) throw new NotFoundError("Result");

  const { schoolId } = context;

  try {
    return await prisma.assessmentResult.update({
      where: {
        schoolId,
        id: input.id,
      },
      data: {
        score: input.score,
        assignmentId: input.testId,
        studentId: input.studentId,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function getExamResultsAction({
  filter,
  query,
  context,
}: GetExamResultsProps) {
  const { schoolId, currentTerm } = context;
  const { studentId, classId, termId, testId } = filter;

  const scope = await resolveAcademicScopeAction({
    classId,
    studentId,
    context,
  });

  if (scope === null) return [];

  const where: ExamResultWhereInput = {
    schoolId,
    exam: {
      termId: termId ?? currentTerm!,
    },

    ...(scope.classIds?.length && {
      student: { classId: { in: scope.classIds } },
    }),

    ...(scope.studentIds?.length && {
      studentId: { in: scope.studentIds },
    }),

    ...(testId && { examId: testId }),
  };

  return await prisma.examResult.findMany({
    where,
    ...query,
    orderBy: { uploadedAt: "desc" },
  });
}

export async function createExamResultAction({
  input,
  query,
  context,
}: CreateExamResultProps) {
  const { schoolId } = context;

  try {
    return await prisma.examResult.create({
      data: {
        schoolId,
        score: input.score,
        examId: input.testId,
        studentId: input.studentId,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function updateExamResultAction({
  input,
  query,
  context,
}: UpdateExamResultProps) {
  if (!input.id) throw new NotFoundError("Result");

  const { schoolId } = context;

  try {
    return await prisma.examResult.update({
      where: {
        schoolId,
        id: input.id,
      },
      data: {
        score: input.score,
        examId: input.testId,
        studentId: input.studentId,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}
