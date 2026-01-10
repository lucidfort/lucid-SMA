import { builder } from "../builder";
import {
  createSubjectAction,
  getSubjectsAction,
  updateSubjectAction,
} from "@/server/actions/subject";
import { AppError, UniqueConstraintError } from "../errors";

const SubjectInput = builder.inputType("SubjectInput", {
  fields: (t) => ({
    id: t.id(),
    name: t.string({ required: true }),
    teachers: t.idList(),
  }),
});

const SubjectFilter = builder.inputType("SubjectFilter", {
  fields: (t) => ({
    teacherId: t.id(),
  }),
});

builder.prismaObject("Subject", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    teachers: t.relation("teacherSubjectAssignments", { nullable: false }),
  }),
});

builder.prismaObject("TeacherSubjectAssignment", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    subject: t.relation("subject", { nullable: false }),
    teacher: t.relation("teacher", { nullable: false }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    subjects: t.prismaField({
      type: ["Subject"],
      authScopes: {
        manager: true,
      },
      args: {
        filter: t.arg({ type: SubjectFilter }),
      },
      resolve: async (query, _parent, args, context) =>
        await getSubjectsAction({ filter: args.filter, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createSubject: t.prismaField({
      type: "Subject",
      authScopes: {
        manager: true,
      },
      args: { input: t.arg({ type: SubjectInput, required: true }) },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createSubjectAction({ input, query, context }),
    }),

    updateSubject: t.prismaField({
      type: "Subject",
      authScopes: {
        manager: true,
      },
      args: { input: t.arg({ type: SubjectInput, required: true }) },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await updateSubjectAction({ input, query, context }),
    }),
  }),
});
