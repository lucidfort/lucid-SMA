import { builder } from "@/lib/pothos/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/lib/pothos/errors";
import { createResultAction, updateResultAction } from "@/lib/actions";
import prisma from "@/lib/prisma";

const ResultType = builder.enumType("ResultType", {
  values: ["ASSIGNMENT", "EXAM"] as const,
});

const ResultInput = builder.inputType("ResultInput", {
  fields: (t) => ({
    id: t.id(),
    score: t.int({ required: true }),
    type: t.field({ type: ResultType, required: true }),
    studentId: t.id({ required: true }),
    testId: t.id({ required: true }),
  }),
});

const ResultFilter = builder.inputType("ResultFilter", {
  fields: (t) => ({
    studentId: t.id({ required: false }),
    classId: t.id({ required: false }),
    testId: t.id({ required: false }),
  }),
});

builder.prismaObject("Result", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    score: t.exposeInt("score", { nullable: false }),
    grade: t.exposeString("grade"),
    uploadedAt: t.expose("uploadedAt", { type: "DateTime", nullable: false }),
    exam: t.relation("exam", {
      args: {
        termId: t.arg.id({ required: false }),
      },
      query: (args, ctx) => ({
        where: {
          schoolId: ctx.schoolId!,
          termId: args.termId || ctx.currentTerm!,
        },
      }),
    }),
    assignment: t.relation("assignment", {
      args: {
        termId: t.arg.id({ required: false }),
      },
      query: (args, ctx) => ({
        where: {
          schoolId: ctx.schoolId!,
          termId: args.termId || ctx.currentTerm!,
        },
      }),
    }),
    student: t.relation("student", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    results: t.prismaField({
      type: ["Result"],
      directives: { rateLimit: { limit: 20, duration: 3600 } },
      args: {
        filter: t.arg({ type: ResultFilter, required: true }),
        termId: t.arg.id({ required: false }),
      },
      authScopes: {
        authenticated: true,
      },
      resolve: async (query, _parent, args, context) => {
        const { studentId, classId, testId } = args.filter;
        return await prisma.result.findMany({
          where: {
            schoolId: context.schoolId!,
            ...(studentId && { studentId }),
            ...(classId && { student: { classId } }),
            ...(testId && {
              OR: [{ examId: testId }, { assignmentId: testId }],
            }),
          },
          ...query,
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createResult: t.prismaField({
      type: "Result",
      args: {
        input: t.arg({ type: ResultInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createResultAction(args.input),
    }),

    updateResult: t.prismaField({
      type: "Result",
      args: {
        input: t.arg({ type: ResultInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (_query, _parent, args) =>
        await updateResultAction(args.input),
    }),
  }),
});
