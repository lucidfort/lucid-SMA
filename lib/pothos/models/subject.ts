import { builder } from "../builder";
import { createSubjectAction, updateSubjectAction } from "@/lib/actions";
import { AppError, UniqueConstraintError } from "../errors";
import prisma from "@/lib/prisma";

const SubjectInput = builder.inputType("SubjectInput", {
  fields: (t) => ({
    id: t.string(),
    name: t.string({ required: true }),
    teachers: t.stringList({ required: true }),
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
  fields: (t) => ({
    subjects: t.prismaField({
      type: ["Subject"],
      args: {
        teacherId: t.arg.id({ required: false }),
      },
      resolve: async (query, _parent, args, ctx) =>
        prisma.subject.findMany({
          ...query,
          where: { schoolId: ctx.schoolId! },
        }),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createSubject: t.prismaField({
      type: "Subject",
      args: { input: t.arg({ type: SubjectInput, required: true }) },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createSubjectAction(args.input),
    }),

    updateSubject: t.prismaField({
      type: "Subject",
      args: { input: t.arg({ type: SubjectInput, required: true }) },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await updateSubjectAction(args.input),
    }),
  }),
});
