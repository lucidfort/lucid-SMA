"use server";

import { PayrollProfileInput } from "../generated/graphql/server";
import { NotFoundError } from "../pothos/errors";
import prisma from "../prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";
import { handleServerErrors } from "../utils";

export const createPayrollProfileAction = async (
  data: Omit<PayrollProfileInput, "id">,
) => {
  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.staffPayrollProfile.create({
      data: {
        schoolId: schoolId!,
        ...data,
      },
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
};

export const updatePayrollProfileAction = async ({
  id,
  ...data
}: PayrollProfileInput) => {
  try {
    const { schoolId } = await getCurrentUser();

    if (!id) throw new NotFoundError("Account");

    return await prisma.staffPayrollProfile.update({
      where: {
        schoolId,
        id,
      },
      data: {
        schoolId: schoolId!,
        ...data,
      },
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
};

export const deletePayrollProfileAction = async (id: string) => {
  try {
    const { schoolId } = await getCurrentUser();

    await prisma.staffPayrollProfile.delete({
      where: {
        id,
        schoolId,
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
