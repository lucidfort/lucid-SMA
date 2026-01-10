import { builder } from "../builder";
import prisma from "@/lib/prisma";
import { AppError, UniqueConstraintError } from "../errors";
import {
  changeGradeStatusAction,
  createGradeAction,
  getGradeAction,
  getGradesAction,
} from "@/server/actions/grade";

const GradeFilter = builder.inputType("GradeFilter", {
  fields: (t) => ({
    programId: t.id(),
    supervisorId: t.string(),
  }),
});

const GradeInput = builder.inputType("GradeInput", {
  fields: (t) => ({
    id: t.id(),
    name: t.string({ required: true }),
    programId: t.string({ required: true }),
  }),
});

builder.prismaObject("Grade", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    isActive: t.exposeBoolean("isActive", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    programId: t.exposeString("programId", { nullable: false }),
    program: t.relation("program", { nullable: false }),
    classes: t.relation("classes", { nullable: false }),
    activeStudentsCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        return prisma.student.count({
          where: { schoolId: parent.schoolId, class: { gradeId: parent.id } },
        });
      },
    }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    grades: t.prismaField({
      type: ["Grade"],
      authScopes: {
        manager: true,
      },
      args: {
        filter: t.arg({ type: GradeFilter }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getGradesAction({ filter, query, context }),
    }),

    grade: t.prismaField({
      type: "Grade",
      authScopes: {
        manager: true,
      },
      args: { id: t.arg.id({ required: true }) },
      resolve: async (query, _parent, { id }, context) =>
        await getGradeAction({ id, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createGrade: t.prismaField({
      type: "Grade",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: GradeInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createGradeAction({ input, query, context }),
    }),

    changeGradeStatus: t.boolean({
      authScopes: {
        manager: true,
      },
      args: {
        id: t.arg.id({ required: true }),
        activate: t.arg.boolean({ required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_parent, args, context) =>
        await changeGradeStatusAction({ ...args, context }),
    }),
  }),
});
