"use server";

import prisma from "@/lib/prisma";
import { TimetableAssignmentSchema } from "@/lib/validation";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";

interface AssignmentDataType
  extends Omit<
    TimetableAssignmentSchema,
    "startTime" | "endTime" | "daysOfWeek"
  > {
  classId: string;
  periodSlotId: string;
}

type PeriodDataType = Omit<
  TimetableAssignmentSchema,
  "subjectId" | "teacherId" | "periodSlotId"
>;

export async function assignTimetableAction(data: AssignmentDataType) {
  try {
    const { schoolId } = await getCurrentUser();
    const { classId, periodSlotId, subjectId, teacherId } = data;

    return await prisma.timetableAssignment.upsert({
      where: {
        periodSlotId_classId: {
          periodSlotId,
          classId,
        },
      },
      update: {
        subjectId,
        teacherId,
      },
      create: {
        schoolId: schoolId!,
        classId,
        periodSlotId,
        subjectId,
        teacherId,
      },
    });
  } catch (e) {
    handleGraphqlServerErrors(e);
  }
}

export async function assignPeriodSlotAction(data: PeriodDataType) {
  try {
    const { schoolId } = await getCurrentUser();
    const { startTime, endTime, daysOfWeek } = data;

    return await prisma.$transaction(async (tx) => {
      const period = await tx.timetablePeriod.upsert({
        where: {
          schoolId_startMinute: {
            schoolId: schoolId!,
            startMinute: startTime,
          },
        },
        update: {
          startMinute: startTime,
          endMinute: endTime,
        },
        create: {
          schoolId: schoolId!,
          startMinute: startTime,
          endMinute: endTime,
        },
      });

      for (const day of daysOfWeek) {
        await tx.periodSlot.upsert({
          where: {
            schoolId_periodId_dayOfWeek: {
              schoolId: schoolId!,
              periodId: "",
              dayOfWeek: parseInt(day),
            },
          },
          update: {
            dayOfWeek: parseInt(day),
          },
          create: {
            schoolId: schoolId!,
            dayOfWeek: parseInt(day),
            periodId: period.id,
          },
        });
      }

      return period;
    });
  } catch (e) {
    handleGraphqlServerErrors(e);
  }
}
