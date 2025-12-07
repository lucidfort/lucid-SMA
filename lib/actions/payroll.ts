"use server";

import { parse } from "date-fns";
import {
  PayrollProfileInput,
  PayrollTransactionInput,
} from "../generated/graphql/server";
import { PaymentStatus } from "../generated/prisma/enums";
import { AppError, NotFoundError } from "../pothos/errors";
import prisma from "../prisma";
import { getCurrentUser, handleGraphqlServerErrors } from "../server/utils";
import { handleServerErrors } from "../utils";
import axios from "axios";

interface PaystackBank {
  id: number;
  name: string;
  code: string;
  active: boolean;
  type: "nuban" | string;
  is_deleted: boolean;
}

interface ResolveRecipientResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

interface CreateRecipientResponse {
  id: number;
  active: boolean;
  recipient_code: string;
  details: {
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
}

interface TransferResponse {
  amount: number;
  reference: string;
  reason: string | null;
  status: "success" | "failed" | "pending";
  failures: any | null;
  transfer_code: string;
  id: number;
}

export const getStandardBanks = async () => {
  try {
    const response = await axios.get(
      "https://api.paystack.co/bank?country=nigeria&type=nuban&perPage=100",
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
        },
      },
    );

    const banks = (response.data as PaystackBank[])
      ?.filter(
        (bank) => bank.active && !bank.is_deleted && bank.type === "nuban",
      )
      .map((bank) => ({
        id: bank.id,
        name: bank.name,
        code: bank.code,
      }));

    return banks;
  } catch (error) {
    console.log(error);
  }
};

export const resolveRecipientAccount = async ({
  accountNumber,
  bankCode,
}: {
  accountNumber: string;
  bankCode: string;
}) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
        },
      },
    );

    if (response.status !== 200)
      throw new AppError(response.statusText, "FAILED_TO_RESOLVE");

    return (response.data as ResolveRecipientResponse).data.account_name;
  } catch (error) {
    throw new AppError(
      error instanceof Error
        ? error?.message
        : "Failed to resolve recipient account",
      "FAILED_TO_RESOLVE",
    );
  }
};

export const createPayrollProfileAction = async (
  data: Omit<PayrollProfileInput, "id">,
) => {
  try {
    const { schoolId } = await getCurrentUser();

    const response = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        account_number: data.accountNumber,
        bank_code: data.bankCode,
        currency: "NGN",
        metadata: {
          id: data.staffId,
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

    if (!response.data.status)
      throw new AppError(
        response.data?.message || response.statusText,
        "RECIPIENT_CREATION_ERROR",
      );

    const recipient = response.data.data as CreateRecipientResponse;

    return await prisma.payrollProfile.create({
      data: {
        schoolId: schoolId!,
        ...data,
        recipientCode: recipient.recipient_code,
        bankName: recipient.details.bank_name,
        bankCode: recipient.details.bank_code,
        accountName: recipient.details.account_name,
        accountNumber: recipient.details.account_number,
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

    return await prisma.payrollProfile.update({
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

    await prisma.payrollProfile.delete({
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

export const generatePayrollReference = async (
  data: PayrollTransactionInput,
) => {
  try {
    const { schoolId } = await getCurrentUser();

    return await prisma.payrollTransactions.create({
      data: {
        ...data,
        schoolId: schoolId!,
      },
    });
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
};

export const initiatePayrollTransfer = async ({
  reference,
  amount,
  profileId,
  month,
  year,
}: PayrollTransactionInput) => {
  if (!reference) throw new NotFoundError("Transaction Reference");
  try {
    const { schoolId } = await getCurrentUser();

    const profile = await prisma.payrollProfile.findUnique({
      where: { schoolId, id: profileId },
      select: { recipientCode: true },
    });

    if (!profile) throw new NotFoundError("Profile");

    const response = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: amount * 100,
        reference,
        recipient: profile.recipientCode,
        reason: `Payment for ${parse(`${year}-${month}-01`, "MMMM yyyy", new Date())}`,
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
        "Failed to initialize payment",
        "PAYROLL_INITIALIZATION_ERROR",
      );
    }

    const res = response.data.data as TransferResponse;

    await prisma.payrollTransactions.update({
      where: { schoolId, id: reference },
      data: {
        status: res.status.toUpperCase() as PaymentStatus,
      },
    });

    return true;
  } catch (error) {
    await handleGraphqlServerErrors(error);
  }
};

export const updatePayrollTransfer = async ({
  type,
  data,
}: {
  type: string;
  data: any;
}) => {
  const { schoolId } = await getCurrentUser();

  const transferCode = data.transfer_code;
  const status = data.status;

  await prisma.payrollTransactions.update({
    where: { schoolId, id: "" },
    data: {
      status,
    },
  });
};
