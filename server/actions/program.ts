"use server";

import { ProgramInput } from "@/lib/generated/graphql/server";
import { ProgramType } from "@/lib/generated/prisma/enums";
import prisma from "@/lib/prisma";
import {
  getCurrentUser,
  handleGraphqlServerErrors,
} from "@/lib/utils/server.utils";
import {
  ProgramCreateArgs,
  ProgramFindManyArgs,
} from "@/lib/generated/prisma/models/Program";
import { ServerActions } from "@/types";

interface GetProgramsProps extends ServerActions {
  query?: Pick<ProgramFindManyArgs, "select" | "include">;
}

interface CreateProgramProps extends ServerActions {
  input: ProgramInput;
  query?: Pick<ProgramCreateArgs, "select" | "include">;
}

interface UpdateProgramStatusProps extends ServerActions {
  id: string;
  activate: boolean;
}

export async function getProgramsAction({ query, context }: GetProgramsProps) {
  const { schoolId } = context;

  return await prisma.program.findMany({
    where: { schoolId },
    ...query,
  });
}

export async function createProgramAction({
  input,
  query,
  context,
}: CreateProgramProps) {
  const { schoolId } = context;

  try {
    return await prisma.$transaction(async (tx) => {
      const program = await tx.program.create({
        data: {
          schoolId,
          name: input.name as ProgramType,
        },
        ...query,
      });

      await tx.grade.createMany({
        data: input.grades.map((grade) => ({
          schoolId,
          programId: program.id,
          name: grade,
        })),
      });

      return program;
    });
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
}

export async function changeProgramStatusAction({
  id,
  activate,
  context,
}: UpdateProgramStatusProps) {
  const { schoolId } = context;

  try {
    const response = await prisma.program.update({
      where: { schoolId, id },
      data: { isActive: activate },
    });

    return !(!response || !response.id);
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
}
