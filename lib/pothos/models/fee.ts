import {
  createInvoiceAction,
  initiateFeePayment,
  updateInvoiceAction,
  verifyPaymentStatus,
} from "@/lib/actions";
import { PaymentStatus as PrismaPaymentStatus } from "@/lib/generated/prisma/enums";
import { builder } from "@/lib/pothos/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/lib/pothos/errors";
import prisma from "@/lib/prisma";

const PaymentStatus = builder.enumType("PaymentStatus", {
  values: ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "FAILED", "REFUNDED"],
});

const InvoiceFilter = builder.inputType("InvoiceFilter", {
  fields: (t) => ({
    invoiceId: t.id(),
    gradeId: t.string(),
    classId: t.string(),
    termId: t.string(),
  }),
});

const InvoicePaymentFilter = builder.inputType("InvoicePaymentFilter", {
  fields: (t) => ({
    studentName: t.string(),
    reference: t.string(),
    startDate: t.field({ type: "DateTime" }),
    endDate: t.field({ type: "DateTime" }),
    status: t.field({ type: PaymentStatus }),
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
              activeState: { in: ["ACTIVE", "SUSPENDED"] },
            },
          });
        }

        return await prisma.student.count({
          where: {
            schoolId: invoice.schoolId,
            activeState: { in: ["ACTIVE", "SUSPENDED"] },
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
  }),
});

builder.prismaObject("InvoicePayment", {
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
  fields: (t) => ({
    invoices: t.prismaField({
      type: ["Invoice"],
      directives: { rateLimit: { limit: 10, duration: 240 } },
      args: {
        filter: t.arg({ type: InvoiceFilter }),
      },
      resolve: async (query, _parent, args, context) => {
        const { termId, gradeId, invoiceId, classId } = args.filter ?? {};
        const { currentTerm, schoolId } = context;

        return await prisma.invoice.findMany({
          ...query,
          where: {
            schoolId: schoolId!,
            ...(invoiceId && { id: invoiceId }),
            termId: termId ?? currentTerm!,
            ...(gradeId && {
              grades: { some: { id: gradeId } },
            }),
            ...(classId && {
              grades: { some: { classes: { some: { id: classId } } } },
            }),
          },
          orderBy: [{ createdAt: "desc" }],
        });
      },
    }),

    invoice: t.prismaField({
      type: "Invoice",
      directives: { rateLimit: { limit: 10, duration: 240 } },
      args: {
        id: t.arg.id({ required: true }),
      },
      authScopes: {
        authenticated: true,
      },
      unauthorizedResolver: () => null,
      resolve: async (query, _parent, args, context) => {
        const { id } = args;
        const { schoolId } = context;

        return await prisma.invoice.findUnique({
          ...query,
          where: {
            schoolId: schoolId!,
            id: id,
          },
        });
      },
    }),

    invoicePayments: t.prismaField({
      type: ["InvoicePayment"],
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      directives: { rateLimit: { limit: 10, duration: 240 } },
      args: {
        filter: t.arg({ type: InvoicePaymentFilter, required: true }),
      },
      resolve: async (query, _parent, args, context) => {
        const { studentName, reference, status, startDate, endDate } =
          args.filter;
        const { schoolId } = context;

        return await prisma.invoicePayment.findMany({
          ...query,
          where: {
            schoolId: schoolId!,
            ...(studentName && {
              students: {
                some: {
                  OR: [
                    { name: { contains: studentName, mode: "insensitive" } },
                    { surname: { contains: studentName, mode: "insensitive" } },
                  ],
                },
              },
            }),

            ...(status && { status: status as PrismaPaymentStatus }),
            ...(reference && { reference }),

            paidAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          },
          orderBy: [{ createdAt: "desc" }],
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createInvoice: t.prismaField({
      type: "Invoice",
      args: {
        input: t.arg({ type: InvoiceInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createInvoiceAction(args.input),
    }),

    updateInvoice: t.prismaField({
      type: "Invoice",
      args: {
        input: t.arg({ type: InvoiceInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (_query, _parent, args) =>
        await updateInvoiceAction(args.input),
    }),

    initiateFeePayment: t.field({
      type: FeePaymentResponse,
      args: {
        input: t.arg({ type: FeePaymentInput, required: true }),
      },
      directives: {
        rateLimit: { limit: 10, duration: 3600 },
      },
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
        parent: true,
      },
      errors: { types: [AppError] },
      resolve: async (_parent, args) => await initiateFeePayment(args.input),
    }),

    verifyPaymentStatus: t.prismaField({
      type: "InvoicePayment",
      args: {
        reference: t.arg.string({ required: true }),
      },
      directives: {
        rateLimit: { limit: 30, duration: 3600 },
      },
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
        parent: true,
      },
      errors: { types: [AppError] },
      resolve: async (_query, _parent, args) =>
        await verifyPaymentStatus({ reference: args.reference }),
    }),
  }),
});
