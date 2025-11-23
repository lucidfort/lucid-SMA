"use server";

import { ClassSchema } from "../validation";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import prisma from "../prisma";
import { Class } from "@/lib/generated/prisma/client";

export const createClassAction = async (
  data: ClassSchema,
): Promise<Class | undefined> => {
  try {
    const { schoolId } = await getCurrentUser();
    const { id, supervisors, ...input } = data;

    return await prisma.class.create({
      data: {
        schoolId: schoolId!,
        ...input,
        ...(id && { id }),
        ...(supervisors && {
          supervisors: {
            connect: supervisors.map((supervisor) => ({
              id: supervisor,
            })),
          },
        }),
      },
    });
  } catch (error: any) {
    handleGraphqlServerErrors(error);
  }
};

export const updateClassAction = async (data: ClassSchema) => {
  try {
    const { schoolId } = await getCurrentUser();
    const { supervisors, ...input } = data;

    return await prisma.class.update({
      where: {
        id: input.id!,
        schoolId,
      },
      data: {
        ...input,
        id: input.id!,
        ...(supervisors && {
          supervisors: {
            set: supervisors.map((supervisor) => ({
              id: supervisor,
            })),
          },
        }),
      },
    });
  } catch (error: any) {
    handleGraphqlServerErrors(error);
  }
};

export const deleteClassAction = async (id: string) => {
  try {
    const { accessLevel, schoolId } = await getCurrentUser();

    if (accessLevel !== "manager") {
      return { success: false, error: "Unauthorized" };
      // throw new AppError("Unauthorized", "UNAUTHORIZED");
    }

    await prisma.class.delete({
      where: {
        id,
        schoolId,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.log(error);
    return { success: false, error: error.message };
  }
};
