import {
  createInvoiceAction,
  getInvoiceAction,
  getInvoicePaymentsAction,
  getInvoicesAction,
  initiateFeePaymentAction,
  updateInvoiceAction,
  verifyPaymentStatusAction,
} from "@/server/actions/fee";
import { builder } from "@/server/graphql/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/server/graphql/errors";
import prisma from "@/lib/prisma";

export const PaymentStatus = builder.enumType("PaymentStatus", {
  values: ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "REFUNDED"],
});

const InvoiceFilter = builder.inputType("InvoiceFilter", {
  fields: (t) => ({
    gradeId: t.string(),
    classId: t.string(),
    termId: t.string(),
  }),
});

const InvoicePaymentFilter = builder.inputType("InvoicePaymentFilter", {
  fields: (t) => ({
    reference: t.string(),
    startDate: t.field({ type: "DateTime" }),
    endDate: t.field({ type: "DateTime" }),
    status: t.field({ type: PaymentStatus }),
    academicYearId: t.id(),
    termId: t.id(),
    invoiceId: t.id(),
    take: t.int(),
    skip: t.int(),
  }),
});

const InvoiceInput = builder.inputType("InvoiceInput", {
  fields: (t) => ({
    id: t.id(),
    number: t.string({ required: true }),
    title: t.string({ required: true }),
    amount: t.int({ required: true }),
    dueDate: t.field({ type: "DateTime" }),
    grades: t.idList(),
    termId: t.id({ required: true }),
  }),
});

const FeePaymentInput = builder.inputType("FeePaymentInput", {
  fields: (t) => ({
    email: t.field({ type: "Email", required: true }),
    invoiceId: t.id({ required: true }),
    amount: t.int({ required: true }),
    studentId: t.string({ required: true }),
  }),
});

const FeePaymentResponse = builder.objectRef<{
  authorization_url: string;
  access_code: string;
  reference: string;
}>("FeePaymentResponse");

FeePaymentResponse.implement({
  fields: (t) => ({
    authorization_url: t.exposeString("authorization_url", { nullable: false }),
    access_code: t.exposeString("access_code", { nullable: false }),
    reference: t.exposeString("reference", { nullable: false }),
  }),
});

builder.prismaObject("Invoice", {
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    number: t.exposeString("number", { nullable: false }),
    title: t.exposeString("title", { nullable: false }),
    amount: t.exposeInt("amount", { nullable: false }),
    dueDate: t.expose("dueDate", { type: "DateTime" }),
    termId: t.exposeString("termId", { nullable: false }),
    grades: t.relation("grades", { nullable: false }),
    term: t.relation("term", { nullable: false }),
    payments: t.relation("payments", { nullable: false }),
    paymentCount: t.relationCount("payments", {
      where: {
        status: "SUCCESS",
      },
    }),
    studentCount: t.int({
      resolve: async (invoice) => {
        const grades = await prisma.grade.findMany({
          where: {
            schoolId: invoice.schoolId,
            invoices: { some: { id: invoice.id } },
          },
          select: { id: true },
        });

        if (grades.length === 0) {
          return await prisma.student.count({
            where: {
              schoolId: invoice.schoolId,
              status: { in: ["ACTIVE", "SUSPENDED"] },
            },
          });
        }

        return await prisma.student.count({
          where: {
            schoolId: invoice.schoolId,
            status: { in: ["ACTIVE", "SUSPENDED"] },
            class: {
              grade: {
                invoices: {
                  some: {
                    id: invoice.id,
                  },
                },
              },
            },
          },
        });
      },
    }),
    hasPaid: t.boolean({
      resolve: async (invoice, _, context) => {
        if (context.accessLevel !== "parent") return false;

        return Boolean(
          await prisma.invoicePayment.findFirst({
            where: {
              invoiceId: invoice.id,
              status: "SUCCESS",
              students: {
                some: {
                  parentStudents: {
                    some: {
                      parent: { clerkUserId: context.userId },
                    },
                  },
                },
              },
            },
            select: { amountPaid: true },
          }),
        );
      },
    }),
  }),
});

builder.prismaObject("InvoicePayment", {
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    reference: t.exposeString("reference", { nullable: false }),
    amountPaid: t.exposeInt("amountPaid", { nullable: false }),
    currency: t.exposeString("currency", { nullable: false }),
    createdAt: t.expose("createdAt", { type: "DateTime", nullable: false }),
    paidAt: t.expose("paidAt", { type: "DateTime" }),
    status: t.expose("status", { type: PaymentStatus, nullable: false }),
    method: t.exposeString("method"),
    payerEmail: t.exposeString("payerEmail"),
    invoice: t.relation("invoice", { nullable: false }),
    students: t.relation("students", { nullable: false }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    invoices: t.prismaField({
      type: ["Invoice"],
      args: {
        filter: t.arg({ type: InvoiceFilter }),
      },
      resolve: async (query, _parent, args, context) =>
        await getInvoicesAction({ filter: args.filter, query, context }),
    }),

    invoice: t.prismaField({
      type: "Invoice",
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, args, context) =>
        await getInvoiceAction({ id: args.id, query, context }),
    }),

    invoicePayments: t.prismaField({
      type: ["InvoicePayment"],
      authScopes: {
        manager: true,
        finance: true,
        parent: true,
      },
      args: {
        filter: t.arg({ type: InvoicePaymentFilter, required: true }),
      },
      resolve: async (query, _parent, args, context) =>
        await getInvoicePaymentsAction({ filter: args.filter, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createInvoice: t.prismaField({
      type: "Invoice",
      authScopes: {
        manager: true,
        finance: true,
      },
      args: {
        input: t.arg({ type: InvoiceInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, args, context) =>
        await createInvoiceAction({ input: args.input, query, context }),
    }),

    updateInvoice: t.prismaField({
      type: "Invoice",
      authScopes: {
        manager: true,
        finance: true,
      },
      args: {
        input: t.arg({ type: InvoiceInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (query, _parent, args, context) =>
        await updateInvoiceAction({ input: args.input, query, context }),
    }),

    initiateFeePayment: t.field({
      type: FeePaymentResponse,
      authScopes: {
        manager: true,
        finance: true,
        parent: true,
      },
      args: {
        input: t.arg({ type: FeePaymentInput, required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (_parent, { input }, context) =>
        await initiateFeePaymentAction({ input, context }),
    }),

    verifyPaymentStatus: t.prismaField({
      type: "InvoicePayment",
      args: {
        reference: t.arg.string({ required: true }),
      },
      authScopes: {
        manager: true,
        finance: true,
        parent: true,
      },
      errors: { types: [AppError] },
      resolve: async (query, _parent, { reference }, context) =>
        await verifyPaymentStatusAction({ reference, query, context }),
    }),
  }),
});
