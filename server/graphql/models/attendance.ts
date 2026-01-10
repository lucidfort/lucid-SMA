import {
  getClassesAttendanceAction,
  getStaffAttendanceAction,
  markClassAttendanceAction,
  markStaffAttendanceAction,
} from "@/server/actions/attendance";
import { builder } from "../builder";
import { AppError } from "../errors";

const AttendanceStatus = builder.enumType("AttendanceStatus", {
  values: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
});

const StaffAttendanceInput = builder.inputType("StaffAttendanceInput", {
  fields: (t) => ({
    staffId: t.id({ required: true }),
    date: t.field({ type: "DateTime", required: true }),
    note: t.string(),
    clockInTime: t.string(),
  }),
});

const AttendanceRecords = builder.inputType("AttendanceRecords", {
  fields: (t) => ({
    studentId: t.id({ required: true }),
    status: t.field({ type: AttendanceStatus, required: true }),
    note: t.string(),
    arrivalTime: t.string(),
  }),
});

const ClassAttendanceInput = builder.inputType("ClassAttendanceInput", {
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
    staffId: t.id(),
    classId: t.id(),
    gradeId: t.id(),
    academicYearId: t.id(),
    termId: t.id(),
    startDate: t.field({ type: "DateTime" }),
    endDate: t.field({ type: "DateTime" }),
  }),
});

builder.prismaObject("ClassAttendance", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    studentId: t.exposeID("studentId", { nullable: false }),
    date: t.expose("date", { type: "DateTime", nullable: false }),
    status: t.expose("status", { type: AttendanceStatus, nullable: false }),
    note: t.exposeString("note"),
    arrivalTime: t.exposeString("arrivalTime"),
  }),
});

builder.prismaObject("StaffAttendance", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    staffId: t.exposeID("staffId", { nullable: false }),
    date: t.expose("date", { type: "DateTime", nullable: false }),
    clockInTime: t.exposeString("clockInTime"),
    note: t.exposeString("note"),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    classAttendances: t.prismaField({
      type: ["ClassAttendance"],
      args: { filter: t.arg({ type: AttendanceFilter, required: true }) },
      authScopes: {
        manager: true,
        teacher: true,
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getClassesAttendanceAction({ filter, query, context }),
    }),

    staffAttendances: t.prismaField({
      type: ["StaffAttendance"],
      args: { filter: t.arg({ type: AttendanceFilter, required: true }) },
      authScopes: {
        manager: true,
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getStaffAttendanceAction({ filter, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    markStaffAttendance: t.prismaField({
      type: "StaffAttendance",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: StaffAttendanceInput, required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (query, _parent, { input }, context) =>
        await markStaffAttendanceAction({ input, query, context }),
    }),

    markClassAttendance: t.prismaField({
      type: ["ClassAttendance"],
      authScopes: {
        manager: true,
      },
      directives: {
        rateLimit: { limit: 5, duration: 3600 },
      },
      args: {
        input: t.arg({ type: ClassAttendanceInput, required: true }),
      },
      errors: { types: [AppError] },
      resolve: async (query, _parent, { input }, context) =>
        await markClassAttendanceAction({ input, query, context }),
    }),
  }),
});
