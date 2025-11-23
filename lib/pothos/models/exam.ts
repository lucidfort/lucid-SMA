import { builder } from "@/lib/pothos/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/lib/pothos/errors";
import {
  createExamAction,
  getExamsAction,
  updateExamAction,
} from "@/lib/actions/exam";

const ExamType = builder.enumType("ExamType", {
  values: ["QUIZ", "TEST", "FINAL", "MIDTERM", "PRACTICAL"],
});

const ExamInput = builder.inputType("ExamInput", {
  fields: (t) => ({
    id: t.id(),
    date: t.field({ type: "DateTime", required: true }),
    startTime: t.string({ required: true }),
    endTime: t.string(),
    type: t.field({ type: ExamType, required: true }),
    maxScore: t.int({ required: true }),
    files: t.stringList(),
    gradeId: t.string({ required: true }),
    subjectId: t.string({ required: true }),
    termId: t.string({ required: true }),
  }),
});

const ExamFilter = builder.inputType("ExamFilter", {
  fields: (t) => ({
    teacherId: t.id({ required: false }),
    gradeId: t.id({ required: false }),
    classId: t.id({ required: false }),
    termId: t.id({ required: false }),
    subjectId: t.id({ required: false }),
  }),
});

builder.prismaObject("Exam", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    date: t.expose("date", { type: "DateTime", nullable: false }),
    startTime: t.exposeString("startTime", { nullable: false }),
    endTime: t.exposeString("endTime"),
    maxScore: t.exposeInt("maxScore", { nullable: false }),
    type: t.expose("type", { type: ExamType, nullable: false }),
    subject: t.relation("subject", { nullable: false }),
    grade: t.relation("grade", { nullable: false }),
    term: t.relation("term", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    exams: t.prismaField({
      type: ["Exam"],
      args: {
        filter: t.arg({ type: ExamFilter, required: false }),
      },
      resolve: async (query, _parent, args) =>
        await getExamsAction({ ...args, query }),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createExam: t.prismaField({
      type: "Exam",
      args: {
        input: t.arg({ type: ExamInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createExamAction(args.input),
    }),

    updateExam: t.prismaField({
      type: "Exam",
      args: {
        input: t.arg({ type: ExamInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (_query, _parent, args) =>
        await updateExamAction(args.input),
    }),
  }),
});
