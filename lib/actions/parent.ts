"use server";

import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import { clerkClient } from "@clerk/nextjs/server";
import { ParentInput } from "../generated/graphql/server";
import { AppError, NotFoundError } from "../pothos/errors";
import prisma from "../prisma";
import { handleServerErrors } from "../utils";
import { createUser, deleteUserAuthInfo, updateUser } from "./school";

const allowedRoles = ["manager", "administration"];

interface Props extends ParentInput {
  slug: string;
}

export const createParentAction = async ({
  password,
  primaryId,
  slug,
  ...data
}: Omit<Props, "id">) => {
  const { accessLevel, schoolId } = await getCurrentUser();

  if (!allowedRoles.includes(accessLevel!)) {
    throw new AppError(
      "You are not authorized to perform this action",
      "UNAUTHORIZED",
    );
  }

  let userId = null;

  const username = `${slug}-${primaryId}`;

  try {
    if (primaryId && password) {
      const user = await createUser({
        username,
        password: password,
        firstName: data.name,
        lastName: data.surname,
        accessLevel: "parent",
        schoolId: schoolId!,
      });

      userId = user.id;
    }

    return await prisma.parent.create({
      data: {
        schoolId: schoolId!,
        clerkUserId: userId,
        ...data,
        ...(primaryId && { primaryId: username }),
      },
    });
  } catch (err: any) {
    if (userId) {
      await deleteUserAuthInfo(userId);
    }

    handleGraphqlServerErrors(err);
  }
};

export const updateParentAction = async ({
  password,
  primaryId,
  slug,
  ...data
}: Props) => {
  if (!data.id) {
    throw new NotFoundError("Parent");
  }

  const { accessLevel, schoolId } = await getCurrentUser();

  if (!allowedRoles.includes(accessLevel!)) {
    throw new AppError(
      "You are not authorized to perform this action",
      "UNAUTHORIZED",
    );
  }

  try {
    const username = `${slug}-${primaryId}`;
    const authData = {
      username,
      firstName: data.name,
      lastName: data.surname,
      schoolId: schoolId!,
      accessLevel: "parent",
      ...(password && { password }),
    };
    if (primaryId && data.clerkUserId) {
      await updateUser({ ...authData, clerkId: data.id });
    } else if (primaryId && !data.clerkUserId && password) {
      await createUser({ ...authData });
    }

    return await prisma.parent.update({
      where: {
        id: data.id,
        schoolId,
      },
      data: {
        ...data,
        ...(primaryId && { primaryId: username }),
        id: data.id!,
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteParentAction = async (parentId: string) => {
  try {
    const client = await clerkClient();
    const { accessLevel, schoolId } = await getCurrentUser();

    if (accessLevel !== "manager") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.parent.delete({
      where: {
        id: parentId,
        schoolId,
      },
    });

    await client.users.deleteUser(parentId);

    return { success: true, error: "" };
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

export const getParents = async (
  currentState: {
    data: { id: string; name: string; surname: string }[] | undefined;
    error: boolean;
  },
  searchTerm: string,
) => {
  try {
    const { schoolId } = await getCurrentUser();

    const parents: { id: string; name: string; surname: string }[] =
      await prisma.parent.findMany({
        where: {
          schoolId,
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { surname: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, surname: true },
      });

    return { data: parents, error: false };
  } catch (error) {
    console.log(error);
    return { data: undefined, error: true };
  }
};
