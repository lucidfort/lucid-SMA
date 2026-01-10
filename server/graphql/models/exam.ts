import { builder } from "@/server/graphql/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/server/graphql/errors";
import {
  createExamAction,
  getExamAction,
  getExamsAction,
  updateExamAction,
} from "@/server/actions/exam";

const ExamType = builder.enumType("ExamType", {
  values: ["QUIZ", "TEST", "FINAL", "MIDTERM", "PRACTICAL"],
});

const ExamInput = builder.inputType("ExamInput", {
  fields: (t) => ({
    id: t.id(),
    date: t.field({ type: "DateTime", required: true }),
    maxScore: t.int({ required: true }),
    type: t.field({ type: ExamType, required: true }),
    gradeId: t.string({ required: true }),
    subjectId: t.string({ required: true }),
  }),
});

const ExamFilter = builder.inputType("ExamFilter", {
  fields: (t) => ({
    teacherId: t.id(),
    gradeId: t.id(),
    classId: t.id(),
    termId: t.id(),
    subjectId: t.id(),
  }),
});

builder.prismaObject("Exam", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    date: t.expose("date", { type: "DateTime", nullable: false }),
    maxScore: t.exposeInt("maxScore", { nullable: false }),
    type: t.expose("type", { type: ExamType, nullable: false }),
    subject: t.relation("subject", { nullable: false }),
    grade: t.relation("grade", { nullable: false }),
    termId: t.exposeString("termId", { nullable: false }),
    term: t.relation("term", { nullable: false }),
    results: t.relation("results", { nullable: false }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    exams: t.prismaField({
      type: ["Exam"],
      authScopes: {
        manager: true,
        teacher: true,
        parent: true,
      },
      args: {
        filter: t.arg({ type: ExamFilter }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getExamsAction({ filter, query, context }),
    }),

    exam: t.prismaField({
      type: "Exam",
      authScopes: {
        manager: true,
        teacher: true,
      },
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, { id }, context) =>
        await getExamAction({ id, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createExam: t.prismaField({
      type: "Exam",
      args: {
        input: t.arg({ type: ExamInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createExamAction({ input, query, context }),
    }),

    updateExam: t.prismaField({
      type: "Exam",
      args: {
        input: t.arg({ type: ExamInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (query, _parent, { input }, context) =>
        await updateExamAction({ input, query, context }),
    }),
  }),
});
