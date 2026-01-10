import { builder } from "../builder";
import {
  AppError,
  AuthenticationError,
  ForeignKeyError,
  UniqueConstraintError,
} from "../errors";
import {
  createParentAction,
  getParentAction,
  getParentsAction,
  updateParentAction,
} from "@/server/actions/parent";

const ParentInput = builder.inputType("ParentInput", {
  fields: (t) => ({
    id: t.string(),
    primaryId: t.string(),
    clerkUserId: t.string(),
    name: t.string({ required: true }),
    surname: t.string({ required: true }),
    email: t.field({ type: "Email" }),
    password: t.string(),
    phone: t.string({ required: true }),
    address: t.string({ required: true }),
  }),
});

const ParentFilter = builder.inputType("ParentFilter", {
  fields: (t) => ({
    searchTerm: t.string(),
  }),
});

builder.prismaObject("Parent", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    primaryId: t.exposeString("primaryId"),
    clerkUserId: t.exposeString("clerkUserId"),
    name: t.exposeString("name", { nullable: false }),
    surname: t.exposeString("surname", { nullable: false }),
    email: t.expose("email", { type: "Email" }),
    address: t.exposeString("address", { nullable: false }),
    phone: t.exposeString("phone", { nullable: false }),
    children: t.relation("parentStudents", {
      nullable: false,
      query: () => {
        return {
          where: { student: { status: { in: ["ACTIVE", "SUSPENDED"] } } },
        };
      },
    }),
    childrenCount: t.relationCount("parentStudents", { nullable: false }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    parents: t.prismaField({
      type: ["Parent"],
      authScopes: { manager: true },
      args: {
        filter: t.arg({ type: ParentFilter }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getParentsAction({ filter, query, context }),
    }),

    parent: t.prismaField({
      type: "Parent",
      authScopes: {
        manager: true,
        parent: true,
      },
      unauthorizedResolver: () => null,
      args: {
        id: t.arg.id(),
        clerkUserId: t.arg.id(),
      },
      resolve: async (query, _parent, args, context) =>
        await getParentAction({ filter: args, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createParent: t.prismaField({
      type: "Parent",
      authScopes: { manager: true },
      args: {
        input: t.arg({ type: ParentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, ForeignKeyError] },
      resolve: async (query, _parent, { input }, context) =>
        await createParentAction({ input, query, context }),
    }),

    updateParent: t.prismaField({
      type: "Parent",
      authScopes: { manager: true },
      args: {
        input: t.arg({ type: ParentInput, required: true }),
      },
      errors: {
        types: [
          AppError,
          UniqueConstraintError,
          ForeignKeyError,
          AuthenticationError,
        ],
      },
      resolve: async (query, _parent, { input }, context) =>
        await updateParentAction({ input, query, context }),
    }),
  }),
});
