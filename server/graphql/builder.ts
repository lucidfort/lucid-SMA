import SchemaBuilder from "@pothos/core";
import ErrorsPlugin from "@pothos/plugin-errors";
import PrismaPlugin from "@pothos/plugin-prisma";
import DirectivePlugin from "@pothos/plugin-directives";
import ScopeAuthPlugin from "@pothos/plugin-scope-auth";

import { GraphQlContext } from "@/types";
import type PrismaTypes from "@/lib/generated/pothos-prisma-types";
import prisma from "@/lib/prisma";

import { DateTimeResolver, EmailAddressResolver } from "graphql-scalars";
import { GraphQLError } from "graphql";

export const builder = new SchemaBuilder<{
  Directives: {
    rateLimit: {
      locations: "OBJECT" | "FIELD_DEFINITION";
      args: { limit: number; duration: number };
    };
  };
  PrismaTypes: PrismaTypes;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    Email: {
      Input: string;
      Output: string;
    };
  };
  Context: GraphQlContext;
  AuthScopes: {
    public: boolean;
    authenticated: boolean;
    manager: boolean;
    teacher: boolean;
    finance: boolean;
    parent: boolean;
  };
}>({
  plugins: [DirectivePlugin, ScopeAuthPlugin, ErrorsPlugin, PrismaPlugin],
  prisma: {
    client: prisma,
    exposeDescriptions: { models: true, fields: true },
    filterConnectionTotalCount: true,
    onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn",
  },
  directives: {
    useGraphQLToolsUnorderedDirectives: true,
  },
  errors: {
    defaultTypes: [Error],
  },
  scopeAuth: {
    treatErrorsAsUnauthorized: true,
    unauthorizedError: () =>
      new GraphQLError(`You are not authorized to perform this action.`, {
        extensions: {
          code: "UNAUTHORIZED",
        },
      }),
    authScopes: (context) => ({
      public: true,
      authenticated: !!context.userId,
      manager: !!context.schoolId && context.accessLevel === "manager",
      teacher: !!context.schoolId && context.accessLevel === "teacher",
      finance: !!context.schoolId && context.accessLevel === "finance",
      parent: !!context.schoolId && context.accessLevel === "parent",
    }),
  },
});

builder.addScalarType("DateTime", DateTimeResolver);
builder.addScalarType("Email", EmailAddressResolver);

export const Sex = builder.enumType("Sex", {
  values: ["MALE", "FEMALE"],
});
