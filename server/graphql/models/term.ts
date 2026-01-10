import { builder } from "@/server/graphql/builder";
import {
  activateTermAction,
  getTermAction,
  getTermsAction,
  upsertTermAction,
} from "@/server/actions/term";
import { AppError, UniqueConstraintError } from "@/server/graphql/errors";

const TermInput = builder.inputType("TermInput", {
  fields: (t) => ({
    id: t.id({ required: false }),
    academicYearId: t.id({ required: true }),
    session: t.string({ required: true }),
    startDate: t.field({ type: "DateTime", required: true }),
    endDate: t.field({ type: "DateTime" }),
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
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    terms: t.prismaField({
      type: ["Term"],
      args: {
        take: t.arg.int(),
      },
      resolve: async (query, _parent, { take }, context) =>
        getTermsAction({ take, query, context }),
    }),

    term: t.prismaField({
      type: "Term",
      authScopes: {
        manager: true,
      },
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, { id }, context) =>
        getTermAction({ id, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    upsertTerm: t.prismaField({
      type: "Term",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: TermInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await upsertTermAction({ input, query, context }),
    }),

    activateTerm: t.prismaField({
      type: "Term",
      args: {
        termId: t.arg.id({ required: true }),
        academicYearId: t.arg.id({ required: true }),
      },
      authScopes: {
        manager: true,
      },
      errors: { types: [AppError] },
      resolve: async (query, _parent, args, context) =>
        await activateTermAction({ ...args, query, context }),
    }),
  }),
});
