import {
  createPayrollProfileAction,
  updatePayrollProfileAction,
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
    accountNumber: t.string({ required: true }),
    bankName: t.string({ required: true }),
    accountName: t.string({ required: true }),
    staffId: t.id({ required: true }),
    salary: t.int({ required: true }),
  }),
});

builder.prismaObject("StaffPayrollProfile", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    bankName: t.exposeString("bankName", { nullable: false }),
    accountNumber: t.exposeString("accountNumber", { nullable: false }),
    accountName: t.exposeString("accountName", { nullable: false }),
    salary: t.exposeInt("salary", { nullable: false }),
    staff: t.relation("staff", { nullable: false }),
  }),
});

builder.prismaObject("PayrollTransactions", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    reference: t.exposeString("reference", { nullable: false }),
    grossAmount: t.exposeInt("grossAmount", { nullable: false }),
    netAmount: t.exposeInt("netAmount", { nullable: false }),
    payYear: t.exposeInt("payYear", { nullable: false }),
    payMonth: t.exposeInt("payMonth", { nullable: false }),
    paymentDate: t.expose("paymentDate", { type: "DateTime" }),
    createdAt: t.expose("createdAt", { type: "DateTime", nullable: false }),
    status: t.expose("status", { type: PaymentStatus, nullable: false }),
    staff: t.relation("staff", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    payrollProfile: t.prismaField({
      type: ["StaffPayrollProfile"],
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      resolve: async (query, _parent, _args, context) => {
        return await prisma.staffPayrollProfile.findMany({
          ...query,
          where: { schoolId: context.schoolId!, staff: { isActive: true } },
        });
      },
    }),

    payrollTransactions: t.prismaField({
      type: ["PayrollTransactions"],
      args: {
        year: t.arg.int({ required: true }),
        month: t.arg.int({ required: true }),
        paymentDate: t.arg({ type: "DateTime" }),
      },
      resolve: async (query, _parent, args, context) => {
        return await prisma.payrollTransactions.findMany({
          ...query,
          where: {
            schoolId: context.schoolId!,
            payYear: args.year,
            payMonth: args.month,
            ...(args.paymentDate && {
              paymentDate: {
                gte: startOfMonth(args.paymentDate),
                lte: endOfMonth(args.paymentDate),
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
      type: "StaffPayrollProfile",
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
      type: "StaffPayrollProfile",
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
  }),
});
