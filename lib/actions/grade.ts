"use server";

import { handleServerErrors } from "../utils";
import { GradeSchema } from "../validation";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import prisma from "../prisma";
import { AppError } from "@/lib/pothos/errors";

export const createGradeAction = async ({ name, programId }: GradeSchema) => {
  const { accessLevel, schoolId } = await getCurrentUser();

  if (accessLevel !== "manager" || !schoolId) {
    throw new AppError("You can't perform this action", "UNAUTHORIZED");
  }

  try {
    return await prisma.grade.create({
      data: {
        name,
        programId,
        schoolId,
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateGradeAction = async ({ id, ...input }: GradeSchema) => {
  const { accessLevel, schoolId } = await getCurrentUser();

  if (accessLevel !== "manager" || !schoolId) {
    throw new AppError("You can't perform this action", "UNAUTHORIZED");
  }

  try {
    return await prisma.grade.update({
      where: {
        id: id!,
        schoolId,
      },
      data: input,
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteGradeAction = async (id: string) => {
  try {
    const { accessLevel, schoolId } = await getCurrentUser();

    if (accessLevel !== "manager") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.grade.delete({
      where: {
        id,
        schoolId,
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
