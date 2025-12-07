import {
  updateAcademicYearStatusAction,
  updateTermStatusAction,
  upsertAcademicYearAction,
  upsertTermAction,
} from "@/lib/actions";
import { builder } from "../builder";
import { AppError, UniqueConstraintError } from "../errors";
import prisma from "@/lib/prisma";

const AcademicYearInput = builder.inputType("AcademicYearInput", {
  fields: (t) => ({
    id: t.id({ required: false }),
    year: t.string({ required: true }),
    startDate: t.field({ type: "DateTime", required: true }),
    endDate: t.field({ type: "DateTime" }),
    isCurrent: t.boolean({ required: true }),
  }),
});

const TermInput = builder.inputType("TermInput", {
  fields: (t) => ({
    id: t.id({ required: false }),
    academicYearId: t.id({ required: true }),
    session: t.string({ required: true }),
    startDate: t.field({ type: "DateTime", required: true }),
    endDate: t.field({ type: "DateTime" }),
    isCurrent: t.boolean({ required: true }),
  }),
});

builder.prismaObject("AcademicYear", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    year: t.exposeString("year", { nullable: false }),
    startDate: t.expose("startDate", { type: "DateTime", nullable: false }),
    endDate: t.expose("endDate", { type: "DateTime" }),
    isCurrent: t.exposeBoolean("isCurrent", { nullable: false }),
    terms: t.relation("terms", { nullable: false }),
  }),
});

builder.prismaObject("Term", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    session: t.exposeInt("session", { nullable: false }),
    startDate: t.expose("startDate", { type: "DateTime", nullable: false }),
    endDate: t.expose("endDate", { type: "DateTime" }),
    isCurrent: t.exposeBoolean("isCurrent", { nullable: false }),
    academicYear: t.relation("academicYear", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    academicYears: t.prismaField({
      type: ["AcademicYear"],
      args: {
        take: t.arg.int({ required: false }),
      },
      resolve: async (query, _parent, args, ctx) =>
        prisma.academicYear.findMany({
          ...query,
          where: {
            schoolId: ctx.schoolId!,
          },
          ...(args?.take && { take: args.take }),
        }),
    }),

    terms: t.prismaField({
      type: ["Term"],
      args: {
        take: t.arg.int({ required: false }),
      },
      resolve: async (query, _parent, args, ctx) =>
        prisma.term.findMany({
          ...query,
          where: {
            schoolId: ctx.schoolId!,
          },
          ...(args?.take && { take: args.take }),
        }),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    mutateAcademicYear: t.prismaField({
      type: "AcademicYear",
      args: {
        input: t.arg({ type: AcademicYearInput, required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
        admin: true,
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await upsertAcademicYearAction(args.input),
    }),

    mutateTerm: t.prismaField({
      type: "Term",
      args: {
        input: t.arg({ type: TermInput, required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
        admin: true,
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await upsertTermAction(args.input),
    }),

    activateTerm: t.boolean({
      args: {
        termId: t.arg.id({ required: true }),
        academicYearId: t.arg.id({ required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
      },
      errors: { types: [AppError] },
      resolve: async (_parent, args, ctx) =>
        await updateTermStatusAction({
          ...args,
          schoolId: ctx.schoolId!,
        }),
    }),

    activateAcademicYear: t.boolean({
      args: {
        academicYearId: t.arg.id({ required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
      },
      errors: { types: [AppError] },
      resolve: async (_parent, args, ctx) =>
        await updateAcademicYearStatusAction({
          ...args,
          schoolId: ctx.schoolId!,
        }),
    }),
  }),
});
