"use server";

import prisma from "@/lib/prisma";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { NotFoundError } from "@/server/graphql/errors";
import { EventFilter, EventInput } from "@/lib/generated/graphql/server";
import {
  EventCreateArgs,
  EventFindManyArgs,
  EventUpdateArgs,
  EventWhereInput,
} from "@/lib/generated/prisma/models/Event";
import { ServerActions } from "@/types";
import { resolveAcademicScopeAction } from "@/server/actions/school";

interface GetEventsProps extends ServerActions {
  filter: EventFilter;
  query?: Pick<EventFindManyArgs, "select" | "include">;
}

interface CreateEventProps extends ServerActions {
  input: Omit<EventInput, "id">;
  query?: Pick<EventCreateArgs, "select" | "include">;
}

interface UpdateEventProps extends ServerActions {
  input: EventInput;
  query?: Pick<EventUpdateArgs, "select" | "include">;
}

export async function getEventsAction({
  filter,
  query,
  context,
}: GetEventsProps) {
  const { schoolId } = context;
  const { date, gradeId, take } = filter;

  const scope = await resolveAcademicScopeAction({ context, gradeId });

  if (scope === null) return [];

  const where: EventWhereInput = {
    schoolId,
    OR: [
      { gradeId: null },
      ...(scope.gradeIds?.length ? [{ gradeId: { in: scope.gradeIds } }] : []),
    ],
    ...(date && { date: { gte: date } }),
  };

  return await prisma.event.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    ...(take && { take }),
    ...query,
  });
}

export async function createEventAction({
  input: { gradeId, ...input },
  query,
  context,
}: CreateEventProps) {
  const { schoolId } = context;
  try {
    return await prisma.event.create({
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

export async function updateEventAction({
  input: { id, gradeId, ...input },
  query,
  context,
}: UpdateEventProps) {
  if (!id) {
    throw new NotFoundError("Event");
  }

  const { schoolId } = context;

  try {
    return await prisma.event.update({
      where: {
        schoolId,
        id,
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
