"use server";

import { PaystackVerifyResponse, ServerActions } from "@/types";
import {
  FeePaymentInput,
  InvoiceFilter,
  InvoiceInput,
  InvoicePaymentFilter,
} from "@/lib/generated/graphql/server";
import { AppError } from "../graphql/errors";
import prisma from "@/lib/prisma";
import { handleGraphqlServerErrors } from "@/lib/utils/server.utils";
import axios, { AxiosError } from "axios";
import { PaymentStatus } from "@/lib/generated/prisma/enums";
import {
  InvoiceCreateArgs,
  InvoiceFindManyArgs,
  InvoiceFindUniqueArgs,
  InvoiceUpdateArgs,
  InvoiceWhereInput,
} from "@/lib/generated/prisma/models/Invoice";
import {
  InvoicePaymentFindManyArgs,
  InvoicePaymentUpdateArgs,
  InvoicePaymentWhereInput,
} from "@/lib/generated/prisma/models/InvoicePayment";
import { resolveAcademicScopeAction } from "@/server/actions/school";

interface GetInvoicesProps extends ServerActions {
  filter?: InvoiceFilter | null;
  query?: Pick<InvoiceFindManyArgs, "select" | "include">;
}

interface GetInvoiceProps extends ServerActions {
  id: string;
  query?: Pick<InvoiceFindUniqueArgs, "select" | "include">;
}

interface GetInvoicePaymentsProps extends ServerActions {
  filter: Omit<InvoicePaymentFilter, "status"> & {
    status?:
      | "PENDING"
      | "PROCESSING"
      | "SUCCESS"
      | "FAILED"
      | "REFUNDED"
      | null;
  };
  query?: Pick<InvoicePaymentFindManyArgs, "select" | "include">;
}

interface CreateInvoiceProps extends ServerActions {
  input: Omit<InvoiceInput, "id">;
  query?: Pick<InvoiceCreateArgs, "select" | "include">;
}

interface UpdateInvoiceProps extends ServerActions {
  input: InvoiceInput;
  query?: Pick<InvoiceUpdateArgs, "select" | "include">;
}

interface InitiateFeePaymentProps extends ServerActions {
  input: FeePaymentInput;
}

interface VerifyPaymentStatusProps extends ServerActions {
  reference: string;
  query?: Pick<InvoicePaymentUpdateArgs, "select" | "include">;
}

export async function getInvoicesAction({
  filter,
  query,
  context,
}: GetInvoicesProps) {
  const { currentTerm, schoolId } = context;
  const { termId, gradeId, classId } = filter ?? {};

  const scope = await resolveAcademicScopeAction({
    context,
    gradeId,
    classId,
  });

  if (scope === null) return [];

  const where: InvoiceWhereInput = {
    schoolId,
    termId: termId ?? currentTerm!,
  };

  const visibility: InvoiceWhereInput[] = [{ grades: { none: {} } }];

  // Class filter takes precedence over grade
  if (scope.classIds?.length) {
    visibility.push({
      grades: {
        some: {
          classes: {
            some: { id: { in: scope.classIds } },
          },
        },
      },
    });
  } else if (scope.gradeIds?.length) {
    visibility.push({
      grades: {
        some: {
          id: { in: scope.gradeIds },
        },
      },
    });
  }

  return await prisma.invoice.findMany({
    where: {
      ...where,
      OR: visibility,
    },
    ...query,
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getInvoiceAction({
  id,
  query,
  context,
}: GetInvoiceProps) {
  const { schoolId } = context;

  return await prisma.invoice.findUnique({
    where: { schoolId, id },
    ...query,
  });
}

export async function getInvoicePaymentsAction({
  filter,
  query,
  context,
}: GetInvoicePaymentsProps) {
  const { schoolId, currentTerm } = context;

  const {
    reference,
    status,
    startDate,
    endDate,
    academicYearId,
    termId = currentTerm,
    invoiceId,
    take,
    skip,
  } = filter;

  const scope = await resolveAcademicScopeAction({ context });

  if (scope === null) return [];

  let sessionScope: InvoiceWhereInput | undefined;

  if (termId) {
    sessionScope = { termId };
  } else if (academicYearId) {
    sessionScope = { term: { academicYearId } };
  }

  const paidAtFilter =
    !sessionScope && (startDate || endDate)
      ? {
          paidAt: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        }
      : {};

  const where: InvoicePaymentWhereInput = {
    schoolId: schoolId!,

    ...(invoiceId && { invoiceId }),
    ...(status && { status: status as PaymentStatus }),
    ...(reference && { reference }),

    ...(sessionScope && { invoice: sessionScope }),

    ...paidAtFilter,

    // scope:
    ...(scope?.studentIds?.length && {
      students: { some: { id: { in: scope.studentIds } } },
    }),
  };

  return await prisma.invoicePayment.findMany({
    where,
    ...query,
    ...(take && { take: take + 1 }),
    ...(skip && { skip }),
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function createInvoiceAction({
  input: { grades, ...input },
  query,
  context,
}: CreateInvoiceProps) {
  try {
    const { schoolId } = context;

    return await prisma.invoice.create({
      data: {
        schoolId: schoolId!,
        ...input,
        ...(grades &&
          grades.length > 0 && {
            grades: {
              connect: grades.map((id) => ({ id })),
            },
          }),
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function updateInvoiceAction({
  input: { id, grades, ...input },
  query,
  context,
}: UpdateInvoiceProps) {
  if (!id) {
    throw new AppError("ID is required to update record", "MISSING_ID");
  }

  try {
    const { schoolId } = context;

    return await prisma.invoice.update({
      where: { schoolId, id },
      data: {
        ...input,
        ...(grades &&
          grades.length > 0 && {
            grades: {
              connect: grades.map((id) => ({ id })),
            },
          }),
      },
      ...query,
    });
  } catch (err: any) {
    await handleGraphqlServerErrors(err);
  }
}

export async function initiateFeePaymentAction({
  input,
  context,
}: InitiateFeePaymentProps) {
  const { schoolId } = context;

  try {
    const amountInKobo = Math.round(input.amount * 100);

    const { data } = await axios.post<{
      status: boolean;
      message?: string;
      data?: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    }>(`${process.env.NEXT_PUBLIC_BASE_URL!}/api/fee-payment/initialize`, {
      email: input.email,
      amount: amountInKobo,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL!}/finance/invoice/transactions`,
      metadata: {
        fee_id: input.invoiceId,
        student_id: input.studentId,
      },
    });

    if (!data?.data?.authorization_url) {
      throw new AppError(
        data?.message ?? "Payment initialization failed",
        "PAYMENT_INITIALIZATION_FAILED",
      );
    }

    await prisma.invoicePayment.create({
      data: {
        schoolId,
        invoiceId: input.invoiceId,
        amountPaid: input.amount,
        reference: data.data.reference,
        status: "PENDING",
        payerEmail: input.email,
        students: {
          connect: { id: input.studentId },
        },
      },
    });

    return data.data;
  } catch (error) {
    throw await handleGraphqlServerErrors(error);
  }
}

export async function verifyPaymentStatusAction({
  reference,
  context,
  query,
}: VerifyPaymentStatusProps) {
  const { schoolId } = context;

  let paystackData: PaystackVerifyResponse["data"] | null = null;

  try {
    const { data } = await axios.get<PaystackVerifyResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL!}/api/fee-payment/verify`,
      { params: { reference } },
    );

    paystackData = data?.data;

    if (!paystackData) {
      throw new AppError(
        "Invalid Verification Response",
        "PAYMENT_VERIFICATION_FAILED",
      );
    }

    const status = paystackData.status.toUpperCase() as PaymentStatus;

    return await prisma.invoicePayment.update({
      where: {
        schoolId_reference: { schoolId, reference },
      },
      data: {
        status,
        method: paystackData.channel,
        paidAt: paystackData.paidAt,
        currency: paystackData.currency,
      },
      ...query,
    });
  } catch (error) {
    // Only update DB if we KNOW the payment failed
    if (paystackData?.status && paystackData?.status !== "success") {
      await prisma.invoicePayment.update({
        where: {
          schoolId_reference: { schoolId, reference },
        },
        data: {
          status: "FAILED",
        },
      });
    }

    // System level failure -> do NOT mark failed
    if (error instanceof AxiosError) {
      throw new AppError(
        "Unable to verify payment. Please retry",
        "PAYMENT_VERIFICATION_UNAVAILABLE",
      );
    }

    await handleGraphqlServerErrors(error);
  }
}
