import { markStaffAttendance, markStudentAttendance } from "@/lib/actions";
import { builder } from "../builder";
import { AppError } from "../errors";
import prisma from "@/lib/prisma";

const StaffAttendanceInput = builder.inputType("StaffAttendanceInput", {
  fields: (t) => ({
    termId: t.id(),
    staffId: t.id({ required: true }),
    date: t.field({ type: "DateTime", required: true }),
    reasonForAbsence: t.string(),
    clockInTime: t.field({ type: "DateTime" }),
  }),
});

const AttendanceRecords = builder.inputType("AttendanceRecords", {
  fields: (t) => ({
    studentId: t.id({ required: true }),
    present: t.boolean({ required: true }),
  }),
});

const StudentAttendanceInput = builder.inputType("StudentAttendanceInput", {
  fields: (t) => ({
    termId: t.id(),
    date: t.field({ type: "DateTime", required: true }),
    classId: t.id({ required: true }),
    records: t.field({ type: [AttendanceRecords], required: true }),
  }),
});

export const AttendanceFilter = builder.inputType("AttendanceFilter", {
  fields: (t) => ({
    studentId: t.id(),
    termId: t.id(),
    classId: t.id(),
    startDate: t.field({ type: "DateTime", required: true }),
    endDate: t.field({ type: "DateTime" }),
  }),
});

builder.prismaObject("StudentAttendance", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    studentId: t.exposeID("studentId", { nullable: false }),
    date: t.expose("date", { type: "DateTime", nullable: false }),
    updatedAt: t.expose("updatedAt", { type: "DateTime", nullable: false }),
    present: t.exposeBoolean("present", { nullable: false }),
    term: t.relation("term", { nullable: false }),
  }),
});

builder.prismaObject("StaffAttendance", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    staffId: t.exposeID("staffId", { nullable: false }),
    date: t.expose("date", { type: "DateTime", nullable: false }),
    clockInTime: t.expose("clockInTime", { type: "DateTime" }),
    reasonForAbsence: t.exposeString("reasonForAbsence"),
    term: t.relation("term", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    studentAttendances: t.prismaField({
      type: ["StudentAttendance"],
      args: { filter: t.arg({ type: AttendanceFilter, required: true }) },
      authScopes: {
        manager: true,
        admin: true,
      },
      directives: {
        rateLimit: { duration: 3600, limit: 10 },
      },
      resolve: async (query, _parent, args, context) => {
        const { termId, startDate, endDate, classId } = args.filter;

        return await prisma.studentAttendance.findMany({
          ...query,
          where: {
            schoolId: context.schoolId!,
            termId: termId ?? context.currentTerm!,
            date: {
              gte: startDate,
              ...(endDate && { lte: endDate }),
            },
            ...(classId && { student: { classId } }),
          },
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    markStaffAttendance: t.prismaField({
      type: "StaffAttendance",
      args: {
        input: t.arg({ type: StaffAttendanceInput, required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (_query, _parent, args, context) =>
        await markStaffAttendance({
          ...args.input,
          termId: args.input.termId ?? context.currentTerm,
        }),
    }),

    markStudentAttendance: t.prismaField({
      type: ["StudentAttendance"],
      args: {
        input: t.arg({ type: StudentAttendanceInput, required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (_query, _parent, args, context) =>
        await markStudentAttendance({
          ...args.input,
          termId: context.currentTerm,
        }),
    }),
  }),
});

// builder.subscriptionType({
//   fields: t => ({

//   })
// })
