"use server";

import prisma from "@/lib/prisma";
import { handleServerErrors } from "../utils";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import { AppError, NotFoundError } from "@/lib/pothos/errors";
import { EventInput } from "@/lib/generated/graphql/server";

export const createEventAction = async (data: EventInput) => {
  const { schoolId, accessLevel } = await getCurrentUser();

  if (!["manager", "administration"].includes(accessLevel!)) {
    throw new AppError(
      "You are authorized to perform this action",
      "UNAUTHORIZED",
    );
  }

  try {
    const { startTime, endTime, gradeId, title, description } = data;
    return await prisma.event.create({
      data: {
        schoolId: schoolId!,
        startTime,
        endTime,
        ...(gradeId && { gradeId }),
        title,
        description,
        termId: "3",
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateEventAction = async (data: EventInput) => {
  const { schoolId } = await getCurrentUser();
  if (!data.id) {
    throw new NotFoundError("Event");
  }

  try {
    const { startTime, endTime, gradeId, title, description } = data;

    return await prisma.event.update({
      where: {
        schoolId: schoolId!,
        id: data.id!,
      },
      data: {
        startTime,
        endTime,
        ...(gradeId && { gradeId }),
        title,
        description,
        termId: "3",
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteEventAction = async (id: string) => {
  try {
    await prisma.event.delete({
      where: {
        id,
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
