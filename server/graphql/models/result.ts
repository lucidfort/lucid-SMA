import { builder } from "@/server/graphql/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/server/graphql/errors";
import {
  getAssessmentResultsAction,
  getExamResultsAction,
  createAssessmentResultAction,
  createExamResultAction,
  updateAssessmentResultAction,
  updateExamResultAction,
} from "@/server/actions/result";

const ResultInput = builder.inputType("ResultInput", {
  fields: (t) => ({
    id: t.id(),
    score: t.int({ required: true }),
    studentId: t.id({ required: true }),
    testId: t.id({ required: true }),
  }),
});

const ResultFilter = builder.inputType("ResultFilter", {
  fields: (t) => ({
    studentId: t.id(),
    termId: t.id(),
    classId: t.id(),
    testId: t.id(),
  }),
});

const ExamResult = builder.prismaObject("ExamResult", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    score: t.exposeInt("score", { nullable: false }),
    uploadedAt: t.expose("uploadedAt", { type: "DateTime", nullable: false }),
    studentId: t.exposeString("studentId", { nullable: false }),
    student: t.relation("student", { nullable: false }),
    exam: t.relation("exam", { nullable: false }),
  }),
});

const AssessmentResult = builder.prismaObject("AssessmentResult", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    score: t.exposeInt("score", { nullable: false }),
    uploadedAt: t.expose("uploadedAt", { type: "DateTime", nullable: false }),
    studentId: t.exposeString("studentId", { nullable: false }),
    student: t.relation("student", { nullable: false }),
    assignment: t.relation("assignment", { nullable: false }),
  }),
});

const Result = builder.unionType("Result", {
  types: [ExamResult, AssessmentResult],
  resolveType: (value) => {
    if ("examId" in value || "exam" in value) {
      return "ExamResult";
    }

    if ("assignmentId" in value || "assignment" in value) {
      return "AssessmentResult";
    }

    return null;
  },
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    results: t.field({
      type: [Result],
      args: {
        filter: t.arg({ type: ResultFilter, required: true }),
      },
      resolve: async (_parent, { filter }, context) => {
        const [assessments, exams] = await Promise.all([
          getAssessmentResultsAction({ filter, context }),

          getExamResultsAction({ filter, context }),
        ]);

        return [...assessments, ...exams].sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        );
      },
    }),

    assessmentResults: t.prismaField({
      type: ["AssessmentResult"],
      args: {
        filter: t.arg({ type: ResultFilter, required: true }),
        termId: t.arg.id({ required: false }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getAssessmentResultsAction({ filter, query, context }),
    }),

    examResults: t.prismaField({
      type: ["ExamResult"],
      args: {
        filter: t.arg({ type: ResultFilter, required: true }),
        termId: t.arg.id({ required: false }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getExamResultsAction({ filter, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createAssessmentResult: t.prismaField({
      type: "AssessmentResult",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: ResultInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createAssessmentResultAction({ input, query, context }),
    }),

    updateAssessmentResult: t.prismaField({
      type: "AssessmentResult",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: ResultInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (query, _parent, { input }, context) =>
        await updateAssessmentResultAction({ input, query, context }),
    }),

    createExamResult: t.prismaField({
      type: "ExamResult",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: ResultInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createExamResultAction({ input, query, context }),
    }),

    updateExamResult: t.prismaField({
      type: "ExamResult",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: ResultInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (query, _parent, { input }, context) =>
        await updateExamResultAction({ input, query, context }),
    }),
  }),
});
