"use server";

import { AppError } from "@/server/graphql/errors";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { SubjectFilter, SubjectInput } from "@/lib/generated/graphql/server";
import prisma from "@/lib/prisma";
import { ServerActions } from "@/types";
import {
  SubjectCreateArgs,
  SubjectFindManyArgs,
  SubjectUpdateArgs,
} from "@/lib/generated/prisma/models/Subject";

interface GetSubjectsProps extends ServerActions {
  filter?: SubjectFilter | null;
  query: Pick<SubjectFindManyArgs, "select" | "include">;
}

interface CreateSubjectProps extends ServerActions {
  input: Omit<SubjectInput, "id">;
  query: Pick<SubjectCreateArgs, "select" | "include">;
}

interface UpdateSubjectProps extends ServerActions {
  input: SubjectInput;
  query: Pick<SubjectUpdateArgs, "select" | "include">;
}

export async function getSubjectsAction({ query, context }: GetSubjectsProps) {
  const { schoolId } = context;

  return await prisma.subject.findMany({
    ...query,
    where: { schoolId },
  });
}

export async function createSubjectAction({
  input,
  query,
  context,
}: CreateSubjectProps) {
  const { schoolId } = context;
  const { name, teachers } = input;

  try {
    return await prisma.subject.create({
      data: {
        schoolId,
        name,
        ...(teachers && teachers.length > 0
          ? {
              teacherSubjectAssignments: {
                createMany: {
                  data: teachers.map((teacherId) => ({
                    schoolId,
                    teacherId,
                  })),
                },
              },
            }
          : {}),
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function updateSubjectAction({
  input: { id, name, teachers },
  query,
  context,
}: UpdateSubjectProps) {
  if (!id) throw new AppError("Subject ID is required", "MISSING_SUBJECT_ID");
  const { schoolId } = context;

  try {
    return await prisma.subject.update({
      where: {
        id,
        schoolId,
      },
      data: {
        name,
        ...(Array.isArray(teachers) && {
          teacherSubjectAssignments: {
            deleteMany: {},
            ...(teachers.length > 0 && {
              create: teachers.map((teacherId) => ({
                teacherId,
                schoolId,
              })),
            }),
          },
        }),
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}
