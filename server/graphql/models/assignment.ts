import { builder } from "@/server/graphql/builder";
import {
  AppError,
  NotFoundError,
  UniqueConstraintError,
} from "@/server/graphql/errors";
import {
  updateAssignmentAction,
  createAssignmentAction,
  getAssignmentsAction,
  getAssignmentAction,
} from "@/server/actions/assignment";

const AssignmentInput = builder.inputType("AssignmentInput", {
  fields: (t) => ({
    id: t.id(),
    dueDate: t.field({ type: "DateTime", required: true }),
    maxScore: t.int({ required: true }),
    classId: t.string({ required: true }),
    subjectId: t.string({ required: true }),
  }),
});

const AssignmentFilter = builder.inputType("AssignmentFilter", {
  fields: (t) => ({
    teacherId: t.id(),
    classId: t.id(),
    termId: t.id(),
    subjectId: t.id(),
  }),
});

builder.prismaObject("Assessment", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    dueDate: t.expose("dueDate", { type: "DateTime", nullable: false }),
    createdAt: t.expose("createdAt", { type: "DateTime", nullable: false }),
    maxScore: t.exposeInt("maxScore", { nullable: false }),
    subject: t.relation("subject", { nullable: false }),
    class: t.relation("class", { nullable: false }),
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
    assignments: t.prismaField({
      type: ["Assessment"],
      authScopes: {
        manager: true,
        teacher: true,
        parent: true,
      },
      args: {
        filter: t.arg({ type: AssignmentFilter }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getAssignmentsAction({ filter, query, context }),
    }),

    assignment: t.prismaField({
      type: "Assessment",
      authScopes: {
        manager: true,
        teacher: true,
      },
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, { id }, context) =>
        await getAssignmentAction({ id, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createAssignment: t.prismaField({
      type: "Assessment",
      authScopes: {
        manager: true,
        teacher: true,
      },
      args: {
        input: t.arg({ type: AssignmentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createAssignmentAction({ input, query, context }),
    }),

    updateAssignment: t.prismaField({
      type: "Assessment",
      authScopes: {
        manager: true,
        teacher: true,
      },
      args: {
        input: t.arg({ type: AssignmentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (query, _parent, { input }, context) =>
        await updateAssignmentAction({ input, query, context }),
    }),
  }),
});
