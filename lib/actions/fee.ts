"use server";

import { PaystackVerifyResponse } from "@/types";
import { FeePaymentInput, InvoiceInput } from "../generated/graphql/server";
import { AppError } from "../pothos/errors";
import prisma from "../prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";
import { handleServerErrors } from "../utils";
import { PaymentStatus } from "../generated/prisma/enums";

export const createInvoiceAction = async (data: Omit<InvoiceInput, "id">) => {
  try {
    const { schoolId } = await getCurrentUser();
    const { grades, ...input } = data;

    return await prisma.invoice.create({
      data: {
        schoolId: schoolId!,
        ...input,
        ...(grades &&
          grades.length > 0 && {
            grades: {
              connect: grades.map((gradeId) => ({ id: gradeId })),
            },
          }),
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const updateInvoiceAction = async (data: InvoiceInput) => {
  try {
    const { schoolId } = await getCurrentUser();
    const { grades, ...input } = data;

    return await prisma.invoice.update({
      where: {
        schoolId: schoolId,
        id: data.id!,
      },
      data: {
        ...input,
        id: data.id!,
        ...(grades &&
          grades.length > 0 && {
            grades: {
              connect: grades.map((gradeId) => ({ id: gradeId })),
            },
          }),
      },
    });
  } catch (err: any) {
    handleGraphqlServerErrors(err);
  }
};

export const deleteInvoiceAction = async (id: string) => {
  try {
    const { schoolId } = await getCurrentUser();

    await prisma.invoice.delete({
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

export const initiateFeePayment = async (data: FeePaymentInput) => {
  try {
    const { accessLevel, schoolId } = await getCurrentUser();

    const amountInKobo = Math.round(data.amount * 100);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL!}/api/fee-payment/initialize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          amount: amountInKobo,
          callback_url:
            accessLevel === "parent"
              ? `${process.env.NEXT_PUBLIC_BASE_URL!}/list/fees/pay`
              : `${process.env.NEXT_PUBLIC_BASE_URL!}/list/transactions`,
          metadata: {
            fee_id: data.invoiceId,
            student_id: data.studentId,
          },
        }),
      },
    );

    const responseData = await response.json();

    if (responseData.status && responseData.data?.authorization_url) {
      try {
        await prisma.invoicePayment.create({
          data: {
            schoolId: schoolId!,
            invoiceId: data.invoiceId,
            amountPaid: data.amount,
            reference: responseData.data.reference,
            status: "PENDING",
            payerEmail: data.email,
            students: {
              connect: {
                id: data.studentId,
              },
            },
          },
        });
      } catch (err) {
        handleGraphqlServerErrors(err);
      }

      return responseData.data;
    } else {
      throw new AppError(
        `${responseData.message || "Payment Initialization Failed"}`,
        "PAYMENT_INITIALIZATION_FAILED",
      );
    }
  } catch (error) {
    handleGraphqlServerErrors(error);
  }
};

export const verifyPaymentStatus = async ({
  reference,
}: {
  reference: string;
}) => {
  try {
    const { schoolId } = await getCurrentUser();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL!}/api/fee-payment/verify?reference=${reference}`,
    );
    const responseData: PaystackVerifyResponse = await response.json();

    console.log(responseData);

    if (responseData.status && responseData.data?.status === "success") {
      return await prisma.invoicePayment.update({
        where: {
          schoolId_reference: {
            schoolId: schoolId!,
            reference: responseData.data.reference,
          },
        },
        data: {
          method: responseData.data.channel,
          status: responseData.data.status.toUpperCase() as PaymentStatus,
          paidAt: responseData.data.paidAt,
          currency: responseData.data.currency,
        },
      });
    } else {
      throw new AppError(
        `${responseData.message || "Payment Verification Failed"}`,
        "PAYMENT_INITIALIZATION_FAILED",
      );
    }
  } catch (error) {
    handleGraphqlServerErrors(error);
  }
};
