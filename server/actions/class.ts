"use server";

import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import prisma from "@/lib/prisma";
import { ClassFilter, ClassInput } from "@/lib/generated/graphql/server";
import { ServerActions } from "@/types";
import {
  ClassCreateArgs,
  ClassFindManyArgs,
  ClassFindUniqueArgs,
} from "@/lib/generated/prisma/models/Class";
import { NotFoundError } from "@/server/graphql/errors";
import { getStaffScope } from "@/server/actions/staff";
import { getParentChildrenScope } from "@/server/actions/parent";

interface GetClassesProps extends ServerActions {
  filter?: ClassFilter | null;
  query?: Pick<ClassFindManyArgs, "select" | "include">;
}

interface GetClassProps extends ServerActions {
  id: string;
  query?: Pick<ClassFindUniqueArgs, "select" | "include">;
}

interface CreateClassProps extends ServerActions {
  input: Omit<ClassInput, "id">;
  query?: Pick<ClassCreateArgs, "select" | "include">;
}

interface UpdateClassProps extends ServerActions {
  input: ClassInput;
  query?: Pick<ClassCreateArgs, "select" | "include">;
}

export async function getClassesAction({
  filter,
  query,
  context,
}: GetClassesProps) {
  const { gradeId, programId, supervisorId } = filter ?? {};
  const { schoolId } = context;

  return await prisma.class.findMany({
    where: {
      schoolId,
      ...(gradeId && { gradeId: gradeId }),
      ...(programId && { grade: { programId } }),
      ...(supervisorId && {
        supervisors: { some: { teacherId: supervisorId } },
      }),
    },
    ...query,
    orderBy: [{ grade: { name: "asc" } }, { name: "asc" }],
  });
}

export async function getClassAction({ id, query, context }: GetClassProps) {
  const { schoolId } = context;

  return await prisma.class.findUnique({
    where: { id, schoolId },
    ...query,
  });
}

export async function createClassAction({
  input: { supervisors, ...input },
  query,
  context,
}: CreateClassProps) {
  const { schoolId } = context;

  try {
    return await prisma.class.create({
      data: {
        schoolId,
        ...input,
        ...(supervisors &&
          supervisors.length > 0 && {
            supervisors: {
              create: supervisors.map((teacherId) => ({
                teacherId,
              })),
            },
          }),
      },
      ...query,
    });
  } catch (error: any) {
    await handleGraphqlServerErrors(error);
  }
}

export async function updateClassAction({
  input: { id, supervisors, ...input },
  query,
  context,
}: UpdateClassProps) {
  const { schoolId } = context;

  if (!id) {
    throw new NotFoundError("Class ID");
  }

  try {
    return await prisma.class.update({
      where: {
        id,
        schoolId,
      },
      data: {
        ...input,
        ...(supervisors &&
          supervisors.length > 0 && {
            supervisors: {
              deleteMany: {},
              create: supervisors.map((teacherId) => ({
                teacherId,
              })),
            },
          }),
      },
      ...query,
    });
  } catch (error: any) {
    await handleGraphqlServerErrors(error);
  }
}
