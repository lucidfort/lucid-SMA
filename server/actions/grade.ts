"use server";

import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import prisma from "@/lib/prisma";
import {
  GradeCreateArgs,
  GradeFindManyArgs,
  GradeFindUniqueArgs,
} from "@/lib/generated/prisma/models/Grade";
import { GradeFilter, GradeInput } from "@/lib/generated/graphql/server";
import { ServerActions } from "@/types";

interface GetGradesProps extends ServerActions {
  filter?: GradeFilter | null;
  query?: Pick<GradeFindManyArgs, "select" | "include">;
}

interface GetGradeProps extends ServerActions {
  id: string;
  query?: Pick<GradeFindUniqueArgs, "select" | "include">;
}

interface CreateGradeProps extends ServerActions {
  input: GradeInput;
  query?: Pick<GradeCreateArgs, "select" | "include">;
}

interface GradeStatusUpdateProps extends ServerActions {
  id: string;
  activate: boolean;
}

export async function getGradesAction({
  filter,
  query,
  context,
}: GetGradesProps) {
  const { schoolId } = context;
  const { programId, supervisorId } = filter ?? {};

  return await prisma.grade.findMany({
    where: {
      schoolId: schoolId!,
      ...(programId && { programId }),
      ...(supervisorId && {
        classes: {
          some: {
            supervisors: {
              some: {
                teacherId: supervisorId,
              },
            },
          },
        },
      }),
    },
    ...query,
  });
}

export async function getGradeAction({ id, query, context }: GetGradeProps) {
  const { schoolId } = context;

  return await prisma.grade.findUnique({
    where: { id, schoolId: schoolId! },
    ...query,
  });
}

export async function createGradeAction({
  input,
  query,
  context,
}: CreateGradeProps) {
  const { schoolId } = context;

  try {
    return await prisma.grade.create({
      data: {
        schoolId,
        name: input.name,
        programId: input.programId,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function changeGradeStatusAction({
  id,
  activate,
  context,
}: GradeStatusUpdateProps) {
  const { schoolId } = context;

  try {
    const response = await prisma.grade.update({
      where: { schoolId, id },
      data: { isActive: activate },
    });

    return !(!response || !response.id);
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
}
