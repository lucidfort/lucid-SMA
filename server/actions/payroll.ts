"use server";

import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import {
  PayrollProfileInput,
  PayrollTransactionInput,
  PayrollTransactionsFilter,
} from "@/lib/generated/graphql/server";
import { PaymentStatus } from "@/lib/generated/prisma/enums";
import { AppError, NotFoundError } from "../graphql/errors";
import prisma from "@/lib/prisma";
import {
  getCurrentUser,
  handleGraphqlServerErrors,
} from "@/lib/utils/server.utils";
import axios, { AxiosError } from "axios";
import {
  PayrollProfileCreateArgs,
  PayrollProfileFindManyArgs,
  PayrollProfileUpdateArgs,
} from "@/lib/generated/prisma/models/PayrollProfile";
import {
  PayrollTransactionCreateArgs,
  PayrollTransactionFindManyArgs,
  PayrollTransactionUpdateArgs,
} from "@/lib/generated/prisma/models/PayrollTransaction";
import {
  CreateRecipientResponse,
  PaystackBank,
  ServerActions,
  TransferResponse,
  UserAuth,
} from "@/types";

interface GetPayrollProfilesProps extends ServerActions {
  active: boolean;
  query?: Pick<PayrollProfileFindManyArgs, "select" | "include">;
}

interface GetPayrollTransactionsProps extends ServerActions {
  filter: PayrollTransactionsFilter;
  query?: Pick<PayrollTransactionFindManyArgs, "select" | "include">;
}

interface ResolveRecipientAccountProps {
  accountNumber: string;
  bankCode: string;
}

interface CreatePayrollProfileProps extends ServerActions {
  input: Omit<PayrollProfileInput, "id">;
  query?: Pick<PayrollProfileCreateArgs, "select" | "include">;
}

interface UpdatePayrollProfileProps extends ServerActions {
  input: PayrollProfileInput;
  query?: Pick<PayrollProfileUpdateArgs, "select" | "include">;
}

interface GeneratePayrollReferenceProps extends ServerActions {
  input: PayrollTransactionInput;
  query?: Pick<PayrollTransactionCreateArgs, "select" | "include">;
}

interface InitiatePayrollTransferProps extends ServerActions {
  input: PayrollTransactionInput;
  query?: Pick<PayrollTransactionUpdateArgs, "select" | "include">;
}

export async function getStandardBanks() {
  try {
    const response = await axios.get<{ data: PaystackBank[] }>(
      "https://api.paystack.co/bank",
      {
        params: {
          country: "nigeria",
          type: "nuban",
          perPage: 100,
        },
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
        },
      },
    );

    return [
      ...new Map(
        response.data.data
          .filter(
            (bank) => bank.active && !bank.is_deleted && bank.type == "nuban",
          )
          .map((bank) => [bank.code, bank]),
      ).values(),
    ].map(({ id, name, code }) => ({ id, name, code }));
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message ?? "Failed to fetch banks");
    }

    throw new Error("Failed to fetch banks");
  }
}

export async function resolveRecipientAccount(
  data: ResolveRecipientAccountProps,
) {
  try {
    const { accountNumber, bankCode } = data;

    const response = await axios.get("https://api.paystack.co/bank/resolve", {
      params: {
        account_number: accountNumber,
        bank_code: bankCode,
      },
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
      },
    });

    return response.data.data.account_name;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new AppError(
        error.response?.data?.message ?? "Failed to resolve recipient account",
        "FAILED_TO_RESOLVE",
      );
    }

    throw new AppError(
      "Failed to resolve recipient account",
      "FAILED_TO_RESOLVE",
    );
  }
}

export async function getPayrollProfilesAction({
  active,
  query,
  context,
}: GetPayrollProfilesProps) {
  const { schoolId } = context;

  return await prisma.payrollProfile.findMany({
    where: {
      schoolId: schoolId!,
      isActive: true,
      staff: { isActive: active },
    },
    ...query,
  });
}

export async function getPayrollTransactionsAction({
  filter,
  query,
  context,
}: GetPayrollTransactionsProps) {
  const { year, month, paymentDate, academicYearId } = filter;
  const { schoolId } = context;

  let paymentDateFilter: { gte: Date; lte: Date } | undefined;

  // Academic Year should take precedence before other filters
  if (academicYearId) {
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId, schoolId },
      select: { startDate: true, endDate: true },
    });

    if (!academicYear) {
      return [];
    }

    paymentDateFilter = {
      gte: academicYear.startDate,
      lte: academicYear.endDate ?? addMonths(academicYear.startDate, 12),
    };
  } else if (paymentDate) {
    paymentDateFilter = {
      gte: startOfMonth(paymentDate),
      lte: endOfMonth(paymentDate),
    };
  }

  return await prisma.payrollTransaction.findMany({
    where: {
      schoolId: schoolId!,

      ...(academicYearId
        ? {}
        : {
            ...(year && { year }),
            ...(month && { month }),
          }),

      ...(paymentDateFilter && {
        paymentDate: paymentDateFilter,
      }),
    },
    ...query,
  });
}

export async function createPayrollProfileAction({
  query,
  input,
  context,
}: CreatePayrollProfileProps) {
  try {
    const { schoolId } = context;

    const response = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        account_number: input.accountNumber,
        bank_code: input.bankCode,
        currency: "NGN",
        metadata: {
          id: input.staffId,
          schoolId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
          "Content-Type": "application/json",
        },
      },
    );

    const recipient = response.data.data as CreateRecipientResponse;

    return await prisma.payrollProfile.create({
      data: {
        schoolId: schoolId!,
        ...input,
        recipientCode: recipient.recipient_code,
        bankName: recipient.details.bank_name,
        bankCode: recipient.details.bank_code,
        accountName: recipient.details.account_name,
        accountNumber: recipient.details.account_number,
      },
      ...query,
    });
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new AppError(
        error.response?.data?.message ?? "Failed to create profile",
        "PROFILE_CREATION_FAILED",
      );
    }

    await handleGraphqlServerErrors(error);
  }
}

export async function updatePayrollProfileAction({
  input: { id, ...input },
  query,
  context,
}: UpdatePayrollProfileProps) {
  if (!id) throw new NotFoundError("Account details");

  try {
    const { schoolId } = context;

    return await prisma.payrollProfile.update({
      where: {
        schoolId,
        id,
      },
      data: {
        schoolId: schoolId!,
        ...input,
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function generatePayrollReferenceAction({
  query,
  input,
  context,
}: GeneratePayrollReferenceProps) {
  try {
    const { schoolId } = context;

    return await prisma.payrollTransaction.create({
      data: {
        ...input,
        schoolId: schoolId!,
      },
      ...query,
    });
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
}

export async function initiatePayrollTransferAction({
  input,
  query,
  context,
}: InitiatePayrollTransferProps) {
  if (!input.reference)
    throw new AppError(
      "Transaction reference is required",
      "INVALID_TRANSACTION_REFERENCE",
    );

  try {
    const { schoolId } = context;

    const profile = await prisma.payrollProfile.findFirst({
      where: { schoolId, id: input.profileId, isActive: true },
      select: { recipientCode: true },
    });

    if (!profile?.recipientCode) {
      throw new AppError(
        "Payroll recipient not found or inactive",
        "RECIPIENT_NOT_FOUND",
      );
    }

    const response = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: Math.round(input.amount * 100),
        reference: input.reference,
        recipient: profile.recipientCode,
        reason: `Payment for ${format(new Date(input.year, input.month - 1), "MMMM yyyy")}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.data?.status) {
      throw new AppError(
        response.data?.message ?? "Failed to initialize payroll transfer",
        "PAYROLL_INITIALIZATION_ERROR",
      );
    }

    const transfer = response.data.data as TransferResponse;

    return await prisma.payrollTransaction.update({
      where: { schoolId, id: input.reference },
      data: {
        status: transfer.status.toUpperCase() as PaymentStatus,
      },
      ...query,
    });
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
}

// TODO: ADD TRANSFER CODE TO THE SCHEMA
export async function updatePayrollTransfer({
  type,
  data,
}: {
  type: string;
  data: any;
}) {
  const user = await getCurrentUser();

  if (!user.isAuthenticated) return false;

  const { schoolId } = user as UserAuth;

  const transferCode = data.transfer_code;
  const status = data.status;

  await prisma.payrollTransaction.update({
    where: { schoolId, id: "" },
    data: {
      status,
    },
  });
}
