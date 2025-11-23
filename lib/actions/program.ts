"use server";

import { ProgramInput } from "../generated/graphql/server";
import { ProgramType } from "../generated/prisma/enums";
import prisma from "../prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";
import { handleServerErrors } from "../utils";

export async function createProgramAction(args: ProgramInput) {
  const { schoolId } = await getCurrentUser();

  try {
    return await prisma.$transaction(async (tx) => {
      const program = await tx.program.create({
        data: {
          name: args.name as ProgramType,
          schoolId: schoolId!,
        },
      });

      await tx.grade.createMany({
        data: args.grades.map((grade) => ({
          schoolId: schoolId!,
          programId: program.id,
          name: grade,
        })),
      });

      return program;
    });
  } catch (e) {
    handleGraphqlServerErrors(e);
  }
}

export async function deleteProgramAction(id: string) {
  try {
    const { schoolId } = await getCurrentUser();

    await prisma.program.delete({
      where: {
        schoolId: schoolId!,
        id,
      },
    });
  } catch (err) {
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
}
