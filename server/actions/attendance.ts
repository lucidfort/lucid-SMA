"use server";

import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import prisma from "@/lib/prisma";
import {
  AttendanceFilter,
  ClassAttendanceInput,
  StaffAttendanceInput,
} from "@/lib/generated/graphql/server";
import {
  ClassAttendanceFindManyArgs,
  ClassAttendanceUpsertArgs,
  ClassAttendanceWhereInput,
} from "@/lib/generated/prisma/models/ClassAttendance";
import {
  StaffAttendanceFindManyArgs,
  StaffAttendanceUpsertArgs,
} from "@/lib/generated/prisma/models/StaffAttendance";
import { ServerActions } from "@/types";

interface GetClassAttendanceProps extends ServerActions {
  query?: Pick<ClassAttendanceFindManyArgs, "select" | "include">;
  filter: AttendanceFilter;
}

interface GetStaffAttendanceProps extends ServerActions {
  query?: Pick<StaffAttendanceFindManyArgs, "select" | "include">;
  filter: AttendanceFilter;
}

interface ClassAttendanceProps extends ServerActions {
  query?: Pick<ClassAttendanceUpsertArgs, "select" | "include">;
  input: Omit<ClassAttendanceInput, "records"> & {
    records: {
      studentId: string;
      note?: string | null | undefined;
      arrivalTime?: string | null | undefined;
      status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    }[];
  };
}

interface StaffAttendanceProps extends ServerActions {
  query?: Pick<StaffAttendanceUpsertArgs, "select" | "include">;
  input: StaffAttendanceInput;
}

export async function getClassesAttendanceAction({
  filter,
  query,
  context,
}: GetClassAttendanceProps) {
  const {
    termId,
    startDate,
    endDate,
    classId,
    gradeId,
    academicYearId,
    studentId,
  } = filter;

  const { schoolId } = context;

  try {
    const where: ClassAttendanceWhereInput = {
      schoolId,
      ...(studentId && { studentId }),
      ...(termId && { termId }),
      ...(academicYearId && { term: { academicYearId } }),

      ...(classId || gradeId
        ? {
            student: {
              ...(classId && { classId }),
              ...(gradeId && { class: { gradeId } }),
            },
          }
        : {}),

      ...(startDate || endDate
        ? {
            date: {
              ...(startDate && { gte: new Date(startDate) }),
              ...(endDate && { lte: new Date(endDate) }),
            },
          }
        : {}),
    };

    return await prisma.classAttendance.findMany({
      where,
      ...query,
      orderBy: { date: "desc" },
    });
  } catch (e) {
    console.log(e);
    throw new Error("Failed to fetch attendance records");
  }
}

export async function getStaffAttendanceAction({
  filter,
  query,
  context,
}: GetStaffAttendanceProps) {
  const { schoolId, currentTerm } = context;
  const { termId, startDate, endDate } = filter;

  try {
    return await prisma.staffAttendance.findMany({
      where: {
        schoolId,
        termId: termId || currentTerm!,
        date: {
          gte: new Date(startDate),
          ...(endDate && { lte: new Date(endDate) }),
        },
      },
      ...query,
      orderBy: { date: "desc" },
    });
  } catch (e) {
    console.log(e);
  }
}

export const markClassAttendanceAction = async ({
  query,
  input: { records, classId, termId, date },
  context,
}: ClassAttendanceProps) => {
  const { schoolId, currentTerm } = context;

  try {
    return await prisma.$transaction(
      records.map((record) =>
        prisma.classAttendance.upsert({
          where: {
            schoolId_classId_studentId_date: {
              schoolId,
              date,
              classId,
              studentId: record.studentId,
            },
          },
          update: {
            status: record.status,
            note: record.note,
            arrivalTime: record.arrivalTime,
          },
          create: {
            schoolId: schoolId!,
            termId: termId || currentTerm!,
            date,
            classId,
            ...record,
          },
          ...query,
        }),
      ),
    );
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
};

export const markStaffAttendanceAction = async ({
  query,
  input,
  context,
}: StaffAttendanceProps) => {
  const { schoolId, currentTerm } = context;

  try {
    return await prisma.staffAttendance.upsert({
      where: {
        schoolId_staffId_date: {
          schoolId,
          date: input.date,
          staffId: input.staffId,
        },
      },
      update: {
        note: input.note,
        clockInTime: input.clockInTime,
      },
      create: {
        schoolId,
        termId: currentTerm!,
        ...input,
      },
      ...query,
    });
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
};
