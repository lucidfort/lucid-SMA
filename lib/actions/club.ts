"use server";

import { handleServerErrors } from "@/lib/utils";
import { ClubSchema } from "@/lib/validation";
import prisma from "../prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";
import { NotFoundError } from "@/lib/pothos/errors";

export const createClubAction = async (data: Omit<ClubSchema, "id">) => {
  try {
    const { schoolId } = await getCurrentUser();
    return await prisma.club.create({
      data: {
        schoolId: schoolId!,
        ...data,
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateClubAction = async ({ id, ...data }: ClubSchema) => {
  if (!id) {
    throw new NotFoundError("Club");
  }

  try {
    return await prisma.club.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteClubAction = async (id: string) => {
  try {
    const { accessLevel, currentUserId } = await getCurrentUser();

    await prisma.club.delete({
      where: {
        id,
        ...(accessLevel === "teacher"
          ? { teacher: { clerkUserId: currentUserId! } }
          : {}),
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
