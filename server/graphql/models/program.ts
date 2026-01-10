import { builder } from "../builder";
import { AppError, UniqueConstraintError } from "../errors";
import {
  changeProgramStatusAction,
  createProgramAction,
  getProgramsAction,
} from "@/server/actions/program";
import { ProgramEnum } from "./school";

const ProgramInput = builder.inputType("ProgramInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    grades: t.stringList({ required: true }),
  }),
});

builder.prismaObject("Program", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    name: t.expose("name", { type: ProgramEnum, nullable: false }),
    isActive: t.exposeBoolean("isActive", { nullable: false }),
    grades: t.relation("grades", { nullable: false }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    programs: t.prismaField({
      type: ["Program"],
      authScopes: {
        manager: true,
      },
      resolve: async (query, _parent, _args, context) =>
        await getProgramsAction({ query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createProgram: t.prismaField({
      type: "Program",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: ProgramInput, required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (query, _parent, { input }, context) => {
        return createProgramAction({ input, query, context });
      },
    }),

    changeProgramStatus: t.boolean({
      authScopes: {
        manager: true,
      },
      args: {
        id: t.arg.id({ required: true }),
        activate: t.arg.boolean({ required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_parent, args, context) =>
        await changeProgramStatusAction({ ...args, context }),
    }),
  }),
});
