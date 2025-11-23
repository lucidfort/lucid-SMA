import { builder } from "../builder";
import prisma from "@/lib/prisma";
import {
  AppError,
  UniqueConstraintError,
  NotFoundError,
  ForeignKeyError,
} from "../errors";
import { createParentAction, updateParentAction } from "@/lib/actions";
import { GraphQLError } from "graphql";

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
          where: { student: { activeState: { in: ["ACTIVE", "SUSPENDED"] } } },
        };
      },
    }),
    childrenCount: t.relationCount("parentStudents", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    parents: t.prismaField({
      type: ["Parent"],
      authScopes: {
        authenticated: true,
        manager: true,
        finance: true,
      },
      directives: { rateLimit: { limit: 20, duration: 3600 } },
      args: {
        searchTerm: t.arg.string({ required: false }),
      },
      resolve: async (query, _parent, args, ctx) =>
        prisma.parent.findMany({
          ...query,
          where: {
            schoolId: ctx.schoolId!,
            ...(args.searchTerm && {
              OR: [
                { name: { contains: args.searchTerm, mode: "insensitive" } },
                { surname: { contains: args.searchTerm, mode: "insensitive" } },
              ],
            }),
          },
        }),
    }),

    parent: t.prismaField({
      type: "Parent",
      authScopes: {
        authenticated: true,
        manager: true,
        parent: true,
      },
      unauthorizedResolver: () => null,
      directives: { rateLimit: { limit: 20, duration: 3600 } },
      args: {
        id: t.arg.id({ required: false }),
        clerkUserId: t.arg.id({ required: false }),
      },
      resolve: async (query, _parent, args, ctx) => {
        const { id, clerkUserId } = args;

        if (!id && !clerkUserId) {
          throw new GraphQLError(
            "You have to provide either an id or clerkUserId",
            {
              extensions: {
                code: "INVALID_REQUEST",
              },
            },
          );
        }

        return await prisma.parent.findFirst({
          ...query,
          where: {
            ...(id && { id: id! }),
            ...(clerkUserId && { clerkUserId: clerkUserId! }),
            schoolId: ctx.schoolId!,
          },
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createParent: t.prismaField({
      type: "Parent",
      args: {
        input: t.arg({ type: ParentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, ForeignKeyError] },
      resolve: async (_query, _parent, args, context) =>
        await createParentAction({ ...args.input, slug: context.slug! }),
    }),

    updateParent: t.prismaField({
      type: "Parent",
      args: {
        input: t.arg({ type: ParentInput, required: true }),
      },
      errors: {
        types: [
          AppError,
          UniqueConstraintError,
          ForeignKeyError,
          NotFoundError,
        ],
      },
      resolve: async (_query, _parent, args, context) =>
        await updateParentAction({ ...args.input, slug: context.slug! }),
    }),
  }),
});
