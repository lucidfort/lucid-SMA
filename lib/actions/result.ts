"use server";

import { handleServerErrors } from "@/lib/utils";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";
import prisma from "../prisma";
import { ResultInput } from "@/lib/generated/graphql/server";
import { NotFoundError } from "@/lib/pothos/errors";

interface InputProps extends Omit<ResultInput, "type"> {
  type: "EXAM" | "ASSIGNMENT";
}

export const createResultAction = async (data: Omit<InputProps, "id">) => {
  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.result.create({
      data: {
        schoolId: schoolId!,
        score: data.score,
        ...(data.type === "EXAM"
          ? { examId: data.testId }
          : { assignmentId: data.testId }),
        studentId: data.studentId,
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateResultAction = async (data: InputProps) => {
  if (!data.id) throw new NotFoundError("Result");

  try {
    return await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        ...(data.type === "EXAM"
          ? { examId: data.testId }
          : { assignmentId: data.testId }),
        studentId: data.studentId,
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteResultAction = async (id: string) => {
  try {
    const { schoolId } = await getCurrentUser();

    await prisma.result.delete({
      where: {
        id,
        schoolId: schoolId!,
      },
    });

    return { success: true, error: false };
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
