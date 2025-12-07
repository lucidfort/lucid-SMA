import {
  createPayrollProfileAction,
  getStandardBanks,
  resolveRecipientAccount,
  updatePayrollProfileAction,
  generatePayrollReference,
  initiatePayrollTransfer,
} from "@/lib/actions/payroll";
import { builder } from "@/lib/pothos/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/lib/pothos/errors";
import prisma from "@/lib/prisma";
import { endOfMonth, startOfMonth } from "date-fns";
import { PaymentStatus } from "./fee";

const PayrollProfileInput = builder.inputType("PayrollProfileInput", {
  fields: (t) => ({
    id: t.id(),
    bankCode: t.string({ required: true }),
    accountNumber: t.string({ required: true }),
    staffId: t.id({ required: true }),
    salary: t.int({ required: true }),
  }),
});

const PayrollTransactionInput = builder.inputType("PayrollTransactionInput", {
  fields: (t) => ({
    amount: t.int({ required: true }),
    year: t.int({ required: true }),
    month: t.int({ required: true }),
    profileId: t.id({ required: true }),
    reference: t.string(),
  }),
});

const SalaryFilterInput = builder.inputType("SalaryFilterInput", {
  fields: (t) => ({
    year: t.int({ required: true }),
    month: t.int({ required: true }),
    paymentDate: t.field({ type: "DateTime" }),
  }),
});

builder.prismaObject("PayrollProfile", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    bankName: t.exposeString("bankName", { nullable: false }),
    accountNumber: t.exposeString("accountNumber", { nullable: false }),
    accountName: t.exposeString("accountName", { nullable: false }),
    salary: t.exposeInt("salary", { nullable: false }),
    recipientCode: t.exposeString("recipientCode", { nullable: false }),
    bankCode: t.exposeString("bankCode", { nullable: false }),
    staff: t.relation("staff", { nullable: false }),
    transactions: t.relation("transactions", {
      authScopes: { manager: true, finance: true },
      args: {
        filter: t.arg({ type: SalaryFilterInput, required: true }),
      },
    }),
  }),
});

builder.prismaObject("PayrollTransactions", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    amount: t.exposeInt("amount", { nullable: false }),
    year: t.exposeInt("year", { nullable: false }),
    month: t.exposeInt("month", { nullable: false }),
    paymentDate: t.expose("paymentDate", { type: "DateTime" }),
    createdAt: t.expose("createdAt", { type: "DateTime", nullable: false }),
    status: t.expose("status", { type: PaymentStatus, nullable: false }),
    profile: t.relation("profile", { nullable: false }),
  }),
});

const StandardBanks = builder.objectRef<{
  id: number;
  name: string;
  code: string;
}>("StandardBanks");

StandardBanks.implement({
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    code: t.exposeString("code", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    standardBanks: t.field({
      type: [StandardBanks],
      authScopes: {
        manager: true,
        finance: true,
      },
      resolve: async () => await getStandardBanks(),
    }),

    resolveRecipientAccount: t.string({
      directives: {
        rateLimit: {
          limit: 10,
          duration: 86400,
        },
      },
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      args: {
        accountNumber: t.arg.string({ required: true }),
        bankCode: t.arg.string({ required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (_parent, args) => await resolveRecipientAccount(args),
    }),

    payrollProfile: t.prismaField({
      type: ["PayrollProfile"],
      directives: {
        rateLimit: {
          limit: 10,
          duration: 86400,
        },
      },
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      resolve: async (query, _parent, _args, context) => {
        return await prisma.payrollProfile.findMany({
          ...query,
          where: { schoolId: context.schoolId!, staff: { isActive: true } },
        });
      },
    }),

    payrollTransactions: t.prismaField({
      type: ["PayrollTransactions"],
      args: {
        filter: t.arg({ type: SalaryFilterInput, required: true }),
      },
      resolve: async (query, _parent, args, context) => {
        const { year, month, paymentDate } = args.filter;
        return await prisma.payrollTransactions.findMany({
          ...query,
          where: {
            schoolId: context.schoolId!,
            year,
            month,
            ...(paymentDate && {
              paymentDate: {
                gte: startOfMonth(paymentDate),
                lte: endOfMonth(paymentDate),
              },
            }),
          },
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createPayrollProfile: t.prismaField({
      type: "PayrollProfile",
      args: {
        input: t.arg({ type: PayrollProfileInput, required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createPayrollProfileAction(args.input),
    }),

    updatePayrollProfile: t.prismaField({
      type: "PayrollProfile",
      args: {
        input: t.arg({ type: PayrollProfileInput, required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (_query, _parent, args) =>
        await updatePayrollProfileAction(args.input),
    }),

    generatePayrollReference: t.prismaField({
      type: "PayrollTransactions",
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      args: {
        input: t.arg({ type: PayrollTransactionInput, required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (_query, _parent, args) =>
        await generatePayrollReference(args.input),
    }),

    initiatePayrollTransfer: t.boolean({
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      args: {
        input: t.arg({ type: PayrollTransactionInput, required: true }),
      },
      errors: { types: [AppError, NotFoundError] },
      resolve: async (_parent, args) =>
        await initiatePayrollTransfer(args.input),
    }),
  }),
});
