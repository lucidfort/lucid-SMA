import { builder } from "@/lib/pothos/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/lib/pothos/errors";
import {
  updateAssignmentAction,
  createAssignmentAction,
  getAssignmentsAction,
} from "@/lib/actions/assignment";

const AssignmentInput = builder.inputType("AssignmentInput", {
  fields: (t) => ({
    id: t.id(),
    startDate: t.field({ type: "DateTime", required: true }),
    dueDate: t.field({ type: "DateTime", required: true }),
    maxScore: t.int({ required: true }),
    files: t.stringList(),
    classId: t.string({ required: true }),
    subjectId: t.string({ required: true }),
    termId: t.string({ required: true }),
  }),
});

const AssignmentFilter = builder.inputType("AssignmentFilter", {
  fields: (t) => ({
    teacherId: t.id({ required: false }),
    classId: t.id({ required: false }),
    termId: t.id({ required: false }),
    subjectId: t.id({ required: false }),
  }),
});

builder.prismaObject("Assignment", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    startDate: t.expose("startDate", { type: "DateTime", nullable: false }),
    dueDate: t.expose("dueDate", { type: "DateTime", nullable: false }),
    maxScore: t.exposeInt("maxScore", { nullable: false }),
    subject: t.relation("subject", { nullable: false }),
    class: t.relation("class", { nullable: false }),
    term: t.relation("term", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    assignments: t.prismaField({
      type: ["Assignment"],
      directives: { rateLimit: { limit: 10, duration: 240 } },
      args: {
        filter: t.arg({ type: AssignmentFilter, required: false }),
      },
      resolve: async (query, _parent, args) =>
        await getAssignmentsAction({ ...args, query }),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createAssignment: t.prismaField({
      type: "Assignment",
      args: {
        input: t.arg({ type: AssignmentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createAssignmentAction(args.input),
    }),

    updateAssignment: t.prismaField({
      type: "Assignment",
      args: {
        input: t.arg({ type: AssignmentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (_query, _parent, args) =>
        await updateAssignmentAction(args.input),
    }),
  }),
});
