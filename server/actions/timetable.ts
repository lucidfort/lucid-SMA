"use server";

import prisma from "@/lib/prisma";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import { ServerActions } from "@/types";
import {
  TimetableAssignmentInput,
  TimetableFilter,
  TimetablePeriodInput,
} from "@/lib/generated/graphql/server";
import { TimetableAssignmentUpsertArgs } from "@/lib/generated/prisma/models/TimetableAssignment";
import {
  TimetablePeriodFindManyArgs,
  TimetablePeriodUpsertArgs,
} from "@/lib/generated/prisma/models/TimetablePeriod";
import { AppError } from "@/server/graphql/errors";

interface GetTimetableRecordsProps extends ServerActions {
  filter: TimetableFilter;
  query: Pick<TimetablePeriodFindManyArgs, "select" | "include">;
}

interface AssignTimetablePeriodProps extends ServerActions {
  input: TimetableAssignmentInput;
  query: Pick<TimetableAssignmentUpsertArgs, "select" | "include">;
}

interface CreateTimetablePeriodProps extends ServerActions {
  input: TimetablePeriodInput;
  query: Pick<TimetablePeriodUpsertArgs, "select" | "include">;
}

export async function getTimetableRecordsAction({
  filter,
  query,
  context,
}: GetTimetableRecordsProps) {
  const { schoolId } = context;
  const { classId } = filter;

  return await prisma.timetablePeriod.findMany({
    where: {
      schoolId,

      ...(classId && {
        assignments: { some: { classId } },
      }),
    },
    ...query,
  });
}

export async function assignTimetablePeriodAction({
  input,
  query,
  context,
}: AssignTimetablePeriodProps) {
  const { schoolId } = context;
  const { classId, periodId, dayOfWeek, subjectId, teacherId } = input;

  try {
    return await prisma.$transaction(async (tx) => {
      const selectedClass = await tx.class.findUnique({
        where: { id: classId, schoolId },
        select: { id: true },
      });

      const selectedPeriod = await tx.timetablePeriod.findUnique({
        where: { id: periodId, schoolId },
        select: { id: true },
      });

      if (!selectedClass || !selectedPeriod) {
        throw new AppError(
          "Invalid class or period for this school",
          "INVALID_TIMETABLE_TARGET",
        );
      }

      return await tx.timetableAssignment.upsert({
        where: {
          classId_dayOfWeek_periodId: {
            periodId,
            classId,
            dayOfWeek,
          },
        },
        update: {
          subjectId,
          teacherId,
        },
        create: {
          dayOfWeek,
          classId,
          periodId,
          subjectId,
          teacherId,
        },
        ...query,
      });
    });
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
}

export async function createTimetablePeriodAction({
  input,
  query,
  context,
}: CreateTimetablePeriodProps) {
  const { schoolId } = context;
  const { startMinute, endMinute } = input;

  if (startMinute >= endMinute) {
    throw new AppError(
      "Start time must be before end time",
      "INVALID_PERIOD_RANGE",
    );
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const overlapping = await tx.timetablePeriod.findFirst({
        where: {
          schoolId,
          AND: [
            { startMinute: { lt: endMinute } },
            { endMinute: { gt: startMinute } },
          ],
        },
        select: { startMinute: true, endMinute: true },
      });

      if (overlapping) {
        throw new AppError(
          `Period overlaps with an existing period (${overlapping.startMinute}-${overlapping.endMinute})`,
          "PERIOD_TIME_OVERLAP",
        );
      }

      return await tx.timetablePeriod.upsert({
        where: {
          schoolId_startMinute_endMinute: {
            schoolId,
            startMinute,
            endMinute,
          },
        },
        update: {
          startMinute,
          endMinute,
        },
        create: {
          schoolId,
          startMinute,
          endMinute,
        },
        ...query,
      });
    });
  } catch (e) {
    await handleGraphqlServerErrors(e);
  }
}
