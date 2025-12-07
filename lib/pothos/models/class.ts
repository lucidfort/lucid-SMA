import {
  assignPeriodSlotAction,
  assignTimetableAction,
  createClassAction,
  updateClassAction,
} from "@/lib/actions";
import { builder } from "@/lib/pothos/builder";
import {
  AppError,
  ForeignKeyError,
  UniqueConstraintError,
} from "@/lib/pothos/errors";
import prisma from "@/lib/prisma";
import { AttendanceFilter } from "./attendance";

const ClassInput = builder.inputType("ClassInput", {
  fields: (t) => ({
    id: t.id(),
    name: t.string({ required: true }),
    capacity: t.int({ required: true }),
    gradeId: t.string({ required: true }),
    supervisors: t.stringList(),
  }),
});

const TimetableAssignmentInput = builder.inputType("TimetableAssignmentInput", {
  fields: (t) => ({
    periodSlotId: t.id({ required: true }),
    classId: t.id({ required: true }),
    subjectId: t.id(),
    teacherId: t.id(),
  }),
});

const TimetablePeriodInput = builder.inputType("TimetablePeriodInput", {
  fields: (t) => ({
    startTime: t.string({ required: true }),
    endTime: t.string({ required: true }),
    daysOfWeek: t.stringList({ required: true }),
  }),
});

const ClassFilterInput = builder.inputType("ClassFilterInput", {
  fields: (t) => ({
    programId: t.id({ required: false }),
    gradeId: t.id({ required: false }),
    name: t.string({ required: false }),
    supervisorId: t.string({ required: false }),
  }),
});

builder.prismaObject("Class", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    capacity: t.exposeInt("capacity", { nullable: false }),
    gradeId: t.exposeString("gradeId", { nullable: false }),
    grade: t.relation("grade", { nullable: false }),
    supervisors: t.relation("supervisors", { nullable: false }),
    students: t.relation("students", { nullable: false }),
    studentCount: t.relationCount("students"),
    attendancePresentCount: t.int({
      nullable: false,
      authScopes: {
        manager: true,
        teacher: true,
        admin: true,
      },
      args: {
        filter: t.arg({
          type: AttendanceFilter,
          required: true,
        }),
      },
      resolve: async (parent, args, ctx) => {
        const { termId, startDate, endDate } = args.filter;

        return await prisma.studentAttendance.count({
          where: {
            classId: parent.id,
            schoolId: ctx.schoolId!,
            termId: termId ?? ctx.currentTerm!,
            present: true,
            date: {
              gte: new Date(startDate),
              ...(endDate && { lte: new Date(endDate) }),
            },
          },
        });
      },
    }),
    attendances: t.relation("attendances", {
      nullable: false,
      authScopes: {
        manager: true,
        teacher: true,
        admin: true,
      },
      args: {
        filter: t.arg({
          type: AttendanceFilter,
          required: true,
        }),
      },
      query(args, ctx) {
        const { termId, startDate, endDate, classId } = args.filter;

        return {
          where: {
            schoolId: ctx.schoolId!,
            termId: termId ?? ctx.currentTerm!,
            date: {
              gte: new Date(startDate),
              ...(endDate && { lte: new Date(endDate) }),
            },
            ...(classId && { student: { classId } }),
          },
          orderBy: { date: "desc" },
        };
      },
    }),
  }),
});

builder.prismaObject("TimetableAssignment", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    periodSlot: t.relation("periodSlot", { nullable: false }),
    class: t.relation("class", { nullable: false }),
    subject: t.relation("subject"),
    teacher: t.relation("teacher"),
  }),
});

builder.prismaObject("TimetablePeriod", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    startTime: t.exposeString("startMinute", { nullable: false }),
    endTime: t.exposeString("endMinute", { nullable: false }),
    periodSlots: t.relation("periodSlots", { nullable: false }),
  }),
});

builder.prismaObject("PeriodSlot", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    dayOfWeek: t.exposeInt("dayOfWeek", { nullable: false }),
    timetableAssignments: t.relation("timetableAssignments", {
      nullable: false,
      args: { classId: t.arg.id({ required: true }) },
      query: (args) => ({
        where: {
          classId: args.classId,
        },
      }),
    }),
  }),
});

builder.queryType({
  fields: (t) => ({
    class: t.prismaField({
      type: "Class",
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, args, context) => {
        return await prisma.class.findUnique({
          where: { id: args.id, schoolId: context.schoolId! },
          ...query,
        });
      },
    }),

    classes: t.prismaField({
      type: ["Class"],
      args: {
        filter: t.arg({ type: ClassFilterInput, required: false }),
      },
      directives: {
        rateLimit: {
          limit: 30,
          duration: 3600,
        },
      },
      resolve: async (query, _parent, args, context) => {
        const { gradeId, programId, supervisorId } = args?.filter ?? {};

        return await prisma.class.findMany({
          where: {
            schoolId: context.schoolId!,
            ...(gradeId && { gradeId: gradeId }),
            ...(programId && { grade: { programId } }),
            ...(supervisorId && {
              supervisors: { some: { id: supervisorId } },
            }),
          },
          ...query,
          orderBy: [{ grade: { name: "asc" } }, { name: "asc" }],
        });
      },
    }),

    timetable: t.prismaField({
      type: ["TimetablePeriod"],
      args: {
        classId: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, args, context) => {
        return await prisma.timetablePeriod.findMany({
          where: {
            schoolId: context.schoolId!,
          },
          ...query,
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createClass: t.prismaField({
      type: "Class",
      args: {
        input: t.arg({ type: ClassInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createClassAction(args.input),
    }),

    updateClass: t.prismaField({
      type: "Class",
      args: {
        input: t.arg({ type: ClassInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, ForeignKeyError] },
      resolve: async (_query, _parent, args) =>
        await updateClassAction(args.input),
    }),

    updateTimetableAssignment: t.prismaField({
      type: "TimetableAssignment",
      args: {
        input: t.arg({ type: TimetableAssignmentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) => {
        const { subjectId, teacherId, ...input } = args.input;

        return await assignTimetableAction({
          ...(teacherId && { teacherId }),
          subjectId: subjectId!,
          ...input,
        });
      },
    }),

    updatePeriodSlot: t.prismaField({
      type: "TimetablePeriod",
      args: {
        input: t.arg({ type: TimetablePeriodInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await assignPeriodSlotAction(args.input),
    }),
  }),
});
