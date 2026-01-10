"use server";

import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { ParentFilter, ParentInput } from "@/lib/generated/graphql/server";
import { AppError, NotFoundError } from "../graphql/errors";
import prisma from "@/lib/prisma";
import { createUserAuth, deleteUserAuth, updateUserAuth } from "./school";
import { ServerActions } from "@/types";
import {
  ParentCreateArgs,
  ParentFindFirstArgs,
  ParentFindManyArgs,
  ParentUpdateArgs,
} from "@/lib/generated/prisma/models/Parent";

interface GetParentsProps extends ServerActions {
  filter?: ParentFilter | null;
  query: Pick<ParentFindManyArgs, "select" | "include">;
}

interface GetParentProps extends ServerActions {
  filter: {
    id?: string | null;
    clerkUserId?: string | null;
  };
  query: Pick<ParentFindFirstArgs, "select" | "include">;
}

interface CreateParentProps extends ServerActions {
  input: Omit<ParentInput, "id">;
  query?: Pick<ParentCreateArgs, "select" | "include">;
}

interface UpdateParentProps extends ServerActions {
  input: ParentInput;
  query?: Pick<ParentUpdateArgs, "select" | "include">;
}

export async function getParentChildrenScope({ context }: ServerActions) {
  const { userId, schoolId } = context;

  const rows = await prisma.parentStudent.findMany({
    where: {
      parent: { schoolId, clerkUserId: userId },
      student: { schoolId, status: { in: ["ACTIVE", "SUSPENDED"] } },
    },
    select: {
      studentId: true,
      student: {
        select: {
          classId: true,
          class: { select: { gradeId: true } },
        },
      },
    },
  });

  const studentIds = new Set<string>();
  const classIds = new Set<string>();
  const gradeIds = new Set<string>();

  for (const row of rows) {
    studentIds.add(row.studentId);
    // @ts-expect-error student field exists, but TS doesn't recognize it
    if (row.student.classId) classIds.add(row.student.classId);

    // @ts-expect-error student field exists, but TS doesn't recognize it
    if (row.student.class?.gradeId) gradeIds.add(row.student.class.gradeId);
  }

  return {
    studentIds: [...studentIds],
    classIds: [...classIds],
    gradeIds: [...gradeIds],
  };
}

export async function getParentsAction({
  filter,
  query,
  context,
}: GetParentsProps) {
  const { schoolId } = context;
  const { searchTerm } = filter ?? {};

  return await prisma.parent.findMany({
    ...query,
    where: {
      schoolId,
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { surname: { contains: searchTerm, mode: "insensitive" } },
        ],
      }),
    },
  });
}

export async function getParentAction({
  filter,
  query,
  context,
}: GetParentProps) {
  const { id, clerkUserId } = filter;

  if (!id && !clerkUserId) {
    throw new AppError(
      "You have to provide either an id or clerkUserId",
      "INVALID_REQUEST",
    );
  }

  const { schoolId } = context;

  return await prisma.parent.findFirst({
    ...query,
    where: {
      ...(id && { id }),
      ...(clerkUserId && { clerkUserId }),
      schoolId,
    },
  });
}

export async function createParentAction({
  input: { password, primaryId, ...input },
  query,
  context,
}: CreateParentProps) {
  const { schoolId, slug } = context;

  if (!slug) {
    throw new AppError("Slug is missing", "MISSING_REQUIRED_SLUG");
  }

  const username = `${slug}-${primaryId}`;
  let clerkUserId = "";

  try {
    if (primaryId && password) {
      const user = await createUserAuth({
        ...input,
        schoolId,
        username,
        password,
        accessLevel: "parent",
      });

      clerkUserId = user.id;
    }

    return await prisma.parent.create({
      data: {
        schoolId,
        clerkUserId,
        ...input,
        ...(primaryId && { primaryId: username }),
      },
      ...query,
    });
  } catch (err: any) {
    if (clerkUserId && clerkUserId !== "") {
      await deleteUserAuth(clerkUserId);
    }

    await handleGraphqlServerErrors(err);
  }
}

export async function updateParentAction({
  input: { id, password, primaryId, ...input },
  query,
  context,
}: UpdateParentProps) {
  if (!id) {
    throw new NotFoundError("Parent ID");
  }

  const { schoolId, slug } = context;

  if (!slug) {
    throw new AppError("Slug is missing", "MISSING_REQUIRED_SLUG");
  }

  const username = `${slug}_${primaryId}`;

  try {
    const authData = {
      ...input,
      username,
      schoolId,
      accessLevel: "parent",
      ...(password && { password }),
    };

    if (primaryId && input.clerkUserId) {
      await updateUserAuth({ ...authData, userClerkId: input.clerkUserId });
    } else if (primaryId && !input.clerkUserId && password) {
      await createUserAuth({ ...authData });
    }

    return await prisma.parent.update({
      where: {
        id,
        schoolId,
      },
      data: {
        ...input,
        ...(primaryId && { primaryId: username }),
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}
