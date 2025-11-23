"use server";

import { AppError } from "@/lib/pothos/errors";
import { getCurrentUser, handleGraphqlServerErrors } from "@/lib/server/utils";
import { SubjectInput } from "../generated/graphql/server";
import prisma from "../prisma";
import { handleServerErrors } from "../utils";

export const createSubjectAction = async (data: SubjectInput) => {
  try {
    const { accessLevel, schoolId } = await getCurrentUser();
    const { name, teachers } = data;

    if (accessLevel !== "manager")
      throw new AppError("Unauthorized", "UNAUTHORIZED");

    return await prisma.$transaction(async (tx) => {
      const subject = await tx.subject.create({
        data: { schoolId: schoolId!, name },
      });

      if (teachers.length > 0) {
        await tx.teacherSubjectAssignment.createMany({
          data: teachers.map((teacherId) => ({
            schoolId: schoolId!,
            subjectId: subject.id,
            teacherId,
          })),
        });
      }

      return subject;
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateSubjectAction = async (data: SubjectInput) => {
  try {
    const { accessLevel, schoolId } = await getCurrentUser();

    if (accessLevel !== "manager")
      throw new AppError("Unauthorized", "UNAUTHORIZED");

    return await prisma.subject.update({
      where: {
        id: data.id!,
        schoolId,
      },
      data: {
        name: data.name,
        ...(data.teachers.length > 0 && {
          teacherSubjectAssignments: {
            connectOrCreate: data.teachers.map((teacherId) => ({
              where: {
                schoolId_teacherId_subjectId: {
                  schoolId: schoolId!,
                  teacherId,
                  subjectId: data.id!,
                },
              },
              create: {
                schoolId: schoolId!,
                subjectId: data.id!,
                teacherId,
              },
            })),
          },
        }),
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteSubjectAction = async (id: string) => {
  try {
    const { accessLevel, schoolId } = await getCurrentUser();

    if (accessLevel !== "manager") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.subject.delete({
      where: {
        id,
        schoolId,
      },
    });

    return { success: true, error: false };
  } catch (err: any) {
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
