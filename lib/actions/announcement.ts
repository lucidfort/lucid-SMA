"use server";

import { AppError, NotFoundError } from "@/lib/pothos/errors";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import { AnnouncementInput } from "../generated/graphql/server";
import prisma from "../prisma";

interface InputProps extends AnnouncementInput {
  termId: string;
}

export const createAnnouncementAction = async (
  data: Omit<InputProps, "id">,
) => {
  const { schoolId, accessLevel } = await getCurrentUser();

  if (!schoolId || !accessLevel)
    throw new AppError("Log in to perform this action", "UNAUTHORIZED");

  const allowedRoles = ["manager", "administration"];
  if (!allowedRoles.includes(accessLevel))
    throw new AppError(
      "You are not authorized to perform this action",
      "UNAUTHORIZED",
    );

  const { gradeId, ...input } = data;

  try {
    return await prisma.announcement.create({
      data: {
        ...input,
        ...(gradeId && { gradeId: gradeId! }),
        schoolId: schoolId!,
        publishedAt: new Date(),
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateAnnouncementAction = async (data: InputProps) => {
  const { id, gradeId, termId, ...input } = data;

  if (!id) throw new NotFoundError("Announcement");

  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.announcement.update({
      where: {
        id,
        schoolId,
        termId,
      },
      data: {
        ...input,
        ...(gradeId && { gradeId: gradeId! }),
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteAnnouncementAction = async (id: string) => {
  try {
    const { schoolId } = await getCurrentUser();

    await prisma.announcement.delete({
      where: {
        id,
        schoolId,
      },
    });

    return { success: true, error: null };
  } catch (err: any) {
    console.log(err);
    return { success: false, error: err.message };
  }
};
