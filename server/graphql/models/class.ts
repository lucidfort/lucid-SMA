import {
  createClassAction,
  getClassAction,
  getClassesAction,
  updateClassAction,
} from "@/server/actions/class";

import { builder } from "@/server/graphql/builder";
import {
  AppError,
  ForeignKeyError,
  UniqueConstraintError,
} from "@/server/graphql/errors";
import { AttendanceFilter } from "./attendance";
import { AttendanceStatus, StudentStatus } from "@/lib/generated/prisma/enums";

const ClassInput = builder.inputType("ClassInput", {
  fields: (t) => ({
    id: t.id(),
    name: t.string({ required: true }),
    capacity: t.int({ required: true }),
    gradeId: t.string({ required: true }),
    supervisors: t.stringList(),
  }),
});

const ClassFilter = builder.inputType("ClassFilter", {
  fields: (t) => ({
    programId: t.id({ required: false }),
    gradeId: t.id({ required: false }),
    name: t.string({ required: false }),
    supervisorId: t.string({ required: false }),
  }),
});

builder.prismaObject("Class", {
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    capacity: t.exposeInt("capacity", { nullable: false }),
    gradeId: t.exposeString("gradeId", { nullable: false }),
    grade: t.relation("grade", { nullable: false }),
    supervisors: t.relation("supervisors", {
      unauthorizedResolver: () => null,
      args: {
        isActive: t.arg.boolean(),
      },
      query: ({ isActive }) => ({
        where: isActive ? { isActive } : undefined,
      }),
    }),
    students: t.relation("students", { nullable: false }),
    activeStudentsCount: t.relationCount("students", {
      where: (_args, context) => ({
        schoolId: context.schoolId!,
        status: { in: [StudentStatus.ACTIVE, StudentStatus.SUSPENDED] },
      }),
    }),
    attendancePresentCount: t.relationCount("attendances", {
      authScopes: {
        authenticated: true,
      },
      args: {
        filter: t.arg({
          type: AttendanceFilter,
          required: true,
        }),
      },
      where: ({ filter }, context) => ({
        schoolId: context.schoolId!,
        termId: filter.termId ?? context.currentTerm!,
        status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT] },
        ...(filter.startDate || filter.endDate
          ? {
              date: {
                ...(filter.startDate && { gte: new Date(filter.startDate) }),
                ...(filter.endDate && { lte: new Date(filter.endDate) }),
              },
            }
          : {}),
      }),
    }),
  }),
});

builder.prismaObject("ClassSupervisor", {
  fields: (t) => ({
    classId: t.exposeID("classId", { nullable: false }),
    teacherId: t.exposeID("teacherId", { nullable: false }),
    class: t.relation("class", { nullable: false }),
    teacher: t.relation("teacher", { nullable: false }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    class: t.prismaField({
      type: "Class",
      authScopes: {
        manager: true,
      },
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, { id }, context) =>
        await getClassAction({ id, query, context }),
    }),

    classes: t.prismaField({
      type: ["Class"],
      authScopes: {
        manager: true,
      },
      args: {
        filter: t.arg({ type: ClassFilter }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        getClassesAction({ filter, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createClass: t.prismaField({
      type: "Class",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: ClassInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createClassAction({ input, query, context }),
    }),

    updateClass: t.prismaField({
      type: "Class",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: ClassInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, ForeignKeyError] },
      resolve: async (query, _parent, { input }, context) =>
        await updateClassAction({ input, query, context }),
    }),
  }),
});
