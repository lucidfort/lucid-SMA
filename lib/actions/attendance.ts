"use server";

import {
  StaffAttendanceInput,
  StudentAttendanceInput,
} from "@/lib/generated/graphql/server";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import prisma from "../prisma";
import { revalidatePath } from "next/cache";

export const markStudentAttendance = async (data: StudentAttendanceInput) => {
  try {
    const { schoolId } = await getCurrentUser();

    const { records, date, classId, termId } = data;

    const response = await Promise.all(
      records.map((record) =>
        prisma.studentAttendance.upsert({
          where: {
            schoolId_classId_studentId_date: {
              schoolId: schoolId!,
              date,
              classId,
              studentId: record.studentId,
            },
          },
          update: {
            present: record.present,
          },
          create: {
            schoolId: schoolId!,
            termId: termId!,
            classId,
            date,
            studentId: record.studentId,
            present: record.present,
          },
        }),
      ),
    );

    revalidatePath("/list/attendances/class");

    return response;
  } catch (error) {
    handleGraphqlServerErrors(error);
  }
};

export const markStaffAttendance = async (data: StaffAttendanceInput) => {
  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.staffAttendance.create({
      data: {
        ...data,
        schoolId: schoolId!,
        termId: data.termId!,
      },
    });
  } catch (error) {
    handleGraphqlServerErrors(error);
  }
};
