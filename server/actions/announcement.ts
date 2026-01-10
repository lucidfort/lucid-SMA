"use server";

import { NotFoundError } from "@/server/graphql/errors";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import {
  AnnouncementFilter,
  AnnouncementInput,
} from "@/lib/generated/graphql/server";
import prisma from "../../lib/prisma";
import {
  AnnouncementCreateArgs,
  AnnouncementFindManyArgs,
  AnnouncementUpdateArgs,
  AnnouncementWhereInput,
} from "@/lib/generated/prisma/models/Announcement";
import { ServerActions } from "@/types";
import { resolveAcademicScopeAction } from "@/server/actions/school";

interface GetAnnouncementsProps extends ServerActions {
  filter: AnnouncementFilter;
  query?: Pick<AnnouncementFindManyArgs, "select" | "include">;
}

interface CreateAnnouncementProps extends ServerActions {
  input: Omit<AnnouncementInput, "id">;
  query?: Pick<AnnouncementCreateArgs, "select" | "include">;
}

interface UpdateAnnouncementProps extends ServerActions {
  input: AnnouncementInput;
  query?: Pick<AnnouncementUpdateArgs, "select" | "include">;
}

export async function getAnnouncementsAction({
  filter,
  query,
  context,
}: GetAnnouncementsProps) {
  const { accessLevel, schoolId } = context;
  const { gradeId, take } = filter;

  const scope = await resolveAcademicScopeAction({ context, gradeId });

  if (scope === null) return [];

  const where: AnnouncementWhereInput = {
    schoolId,
    OR: [
      { gradeId: null }, // global announcements
      ...(scope.gradeIds?.length ? [{ gradeId: { in: scope.gradeIds } }] : []),
    ],
    ...(accessLevel === "parent" ? { staffOnly: false } : {}),
  };

  return await prisma.announcement.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    ...query,
    ...(take && { take }),
  });
}

export async function createAnnouncementAction({
  input: { gradeId, ...input },
  query,
  context,
}: CreateAnnouncementProps) {
  const { schoolId } = context;

  try {
    return await prisma.announcement.create({
      data: {
        schoolId,
        ...input,
        ...(gradeId && { gradeId }),
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function updateAnnouncementAction({
  input: { id, gradeId, ...input },
  query,
  context,
}: UpdateAnnouncementProps) {
  if (!id) {
    throw new NotFoundError("Announcement");
  }

  const { schoolId } = context;

  try {
    return await prisma.announcement.update({
      where: {
        id,
        schoolId,
      },
      data: {
        ...input,
        ...(gradeId && { gradeId }),
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}
