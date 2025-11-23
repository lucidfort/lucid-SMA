import { builder } from "../builder";
import prisma from "@/lib/prisma";
import { AppError, UniqueConstraintError } from "../errors";
import { createGradeAction, updateGradeAction } from "@/lib/actions";
import { EventFilter } from "./event";

const GradeFilterInput = builder.inputType("GradeFilterInput", {
  fields: (t) => ({
    programId: t.id(),
    name: t.string(),
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
    name: t.exposeString("name", { nullable: false }),
    programId: t.exposeString("programId", { nullable: false }),
    program: t.relation("program", { nullable: false }),
    classes: t.relation("classes", { nullable: false }),
    studentCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        return prisma.student.count({
          where: { schoolId: parent.schoolId, class: { gradeId: parent.id } },
        });
      },
    }),
    events: t.relation("events", {
      nullable: false,
      args: {
        eventsFilter: t.arg({ type: EventFilter, required: true }),
      },
      query: (args, ctx) => {
        const { endTime, startTime, termId } = args.eventsFilter;

        return {
          where: {
            schoolId: ctx.schoolId!,
            termId: termId ? termId : ctx.currentTerm!,
            startTime: {
              gte: startTime,
              ...(endTime && { lte: endTime }),
            },
          },
          orderBy: { startTime: "asc" },
        };
      },
    }),
  }),
});

builder.queryType({
  fields: (t) => ({
    grades: t.prismaField({
      type: ["Grade"],
      args: {
        filter: t.arg({ type: GradeFilterInput, required: false }),
      },
      resolve: async (query, _parent, args, ctx) => {
        const { programId, supervisorId } = args?.filter ?? {};

        return await prisma.grade.findMany({
          ...query,
          where: {
            schoolId: ctx.schoolId!,
            ...(programId && { programId }),
            ...(supervisorId && {
              classes: {
                some: {
                  supervisors: {
                    some: {
                      id: supervisorId,
                    },
                  },
                },
              },
            }),
          },
        });
      },
    }),

    grade: t.prismaField({
      type: "Grade",
      args: { id: t.arg.id({ required: true }) },
      resolve: async (query, _parent, args, context) => {
        return await prisma.grade.findUnique({
          where: { id: args.id, schoolId: context.schoolId! },
          ...query,
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createGrade: t.prismaField({
      type: "Grade",
      args: {
        input: t.arg({ type: GradeInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createGradeAction(args.input),
    }),

    updateGrade: t.prismaField({
      type: "Grade",
      args: {
        input: t.arg({ type: GradeInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await updateGradeAction(args.input),
    }),
  }),
});
