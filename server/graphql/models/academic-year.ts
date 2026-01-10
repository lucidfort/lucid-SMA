import {
  activateAcademicYearAction,
  getAcademicYearAction,
  getAcademicYearsAction,
  upsertAcademicYearAction,
} from "@/server/actions/academic-year";
import { builder } from "../builder";
import { AppError, UniqueConstraintError } from "../errors";

const AcademicYearInput = builder.inputType("AcademicYearInput", {
  fields: (t) => ({
    id: t.id({ required: false }),
    year: t.string({ required: true }),
    startDate: t.field({ type: "DateTime", required: true }),
    endDate: t.field({ type: "DateTime" }),
  }),
});

builder.prismaObject("AcademicYear", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    year: t.exposeString("year", { nullable: false }),
    startDate: t.expose("startDate", { type: "DateTime", nullable: false }),
    endDate: t.expose("endDate", { type: "DateTime" }),
    isCurrent: t.exposeBoolean("isCurrent", { nullable: false }),
    terms: t.relation("terms", {
      nullable: false,
      args: {
        isCurrent: t.arg.boolean(),
      },
      query: (args) => ({
        where: {
          ...(args?.isCurrent && { isCurrent: args.isCurrent! }),
        },
      }),
    }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    academicYears: t.prismaField({
      type: ["AcademicYear"],
      args: {
        take: t.arg.int({ required: false }),
      },
      resolve: async (query, _parent, { take }, context) =>
        await getAcademicYearsAction({ query, take, context }),
    }),

    academicYear: t.prismaField({
      type: "AcademicYear",
      authScopes: {
        manager: true,
      },
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, { id }, context) =>
        await getAcademicYearAction({ query, id, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    upsertAcademicYear: t.prismaField({
      type: "AcademicYear",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: AcademicYearInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await upsertAcademicYearAction({ input, query, context }),
    }),

    activateAcademicYear: t.prismaField({
      type: "AcademicYear",
      authScopes: {
        manager: true,
      },
      args: {
        academicYearId: t.arg.id({ required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (query, _parent, { academicYearId }, context) =>
        await activateAcademicYearAction({
          academicYearId,
          query,
          context,
        }),
    }),
  }),
});
