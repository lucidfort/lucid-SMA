import {
  createPayrollProfileAction,
  generatePayrollReferenceAction,
  getPayrollProfilesAction,
  getPayrollTransactionsAction,
  getStandardBanks,
  initiatePayrollTransferAction,
  resolveRecipientAccount,
  updatePayrollProfileAction,
} from "@/server/actions/payroll";
import { builder } from "@/server/graphql/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/server/graphql/errors";
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

const PayrollTransactionsFilter = builder.inputType(
  "PayrollTransactionsFilter",
  {
    fields: (t) => ({
      year: t.int(),
      month: t.int(),
      paymentDate: t.field({ type: "DateTime" }),
      academicYearId: t.id(),
    }),
  },
);

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
        filter: t.arg({ type: PayrollTransactionsFilter, required: true }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getPayrollTransactionsAction({ filter, query, context }),
    }),
  }),
});

builder.prismaObject("PayrollTransaction", {
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
  authScopes: {
    authenticated: true,
  },
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
          duration: 8400,
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
      args: {
        active: t.arg.boolean({ required: true }),
      },
      resolve: async (query, _parent, { active }, context) =>
        await getPayrollProfilesAction({ active, query, context }),
    }),

    payrollTransactions: t.prismaField({
      type: ["PayrollTransaction"],
      args: {
        filter: t.arg({ type: PayrollTransactionsFilter, required: true }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getPayrollTransactionsAction({ filter, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createPayrollProfile: t.prismaField({
      type: "PayrollProfile",
      authScopes: {
        manager: true,
        finance: true,
      },
      args: {
        input: t.arg({ type: PayrollProfileInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createPayrollProfileAction({ input, query, context }),
    }),

    updatePayrollProfile: t.prismaField({
      type: "PayrollProfile",
      authScopes: {
        manager: true,
        finance: true,
      },
      args: {
        input: t.arg({ type: PayrollProfileInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (query, _parent, { input }, context) =>
        await updatePayrollProfileAction({ input, query, context }),
    }),

    generatePayrollReference: t.prismaField({
      type: "PayrollTransaction",
      authScopes: {
        manager: true,
        finance: true,
      },
      args: {
        input: t.arg({ type: PayrollTransactionInput, required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (query, _parent, { input }, context) =>
        await generatePayrollReferenceAction({
          input,
          query,
          context,
        }),
    }),

    initiatePayrollTransfer: t.prismaField({
      type: "PayrollTransaction",
      authScopes: {
        manager: true,
        finance: true,
      },
      args: {
        input: t.arg({ type: PayrollTransactionInput, required: true }),
      },
      errors: { types: [AppError, NotFoundError] },
      resolve: async (query, _parent, { input }, context) =>
        await initiatePayrollTransferAction({
          input,
          query,
          context,
        }),
    }),
  }),
});
