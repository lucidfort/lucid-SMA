import { createStudentAction, updateStudentAction } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { builder, Sex } from "../builder";
import {
  AppError,
  ForeignKeyError,
  NotFoundError,
  UniqueConstraintError,
} from "../errors";
import { AttendanceFilter } from "./attendance";

const ParentStudentRelationship = builder.enumType(
  "ParentStudentRelationship",
  {
    values: ["FATHER", "MOTHER", "GUARDIAN", "GRANDPARENT", "SIBLING", "OTHER"],
  },
);

const GuardianInput = builder.inputType("GuardianInput", {
  fields: (t) => ({
    id: t.id({ required: true }),
    relation: t.field({ type: ParentStudentRelationship, required: true }),
  }),
});

const StudentInput = builder.inputType("StudentInput", {
  fields: (t) => ({
    id: t.id(),
    surname: t.string({ required: true }),
    name: t.string({ required: true }),
    birthday: t.field({ type: "DateTime", required: true }),
    address: t.string({ required: true }),
    registrationNumber: t.string({ required: true }),
    img: t.string(),
    oldImg: t.string(),
    sex: t.field({ type: Sex, required: true }),
    primaryGuardian: t.field({ type: GuardianInput, required: true }),
    secondaryGuardian: t.field({ type: GuardianInput }),
    medicalCondition: t.string(),
    classId: t.string({ required: true }),
  }),
});

const StudentFilter = builder.inputType("StudentFilter", {
  fields: (t) => ({
    parentId: t.id(),
    grades: t.idList(),
  }),
});

builder.prismaObject("Student", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    surname: t.exposeString("surname", { nullable: false }),
    address: t.exposeString("address", { nullable: false }),
    img: t.exposeString("img"),
    sex: t.expose("sex", { type: Sex, nullable: false }),
    birthday: t.expose("birthday", { type: "DateTime", nullable: false }),
    admissionDate: t.expose("admissionDate", { type: "DateTime" }),
    registrationNumber: t.exposeString("registrationNumber", {
      nullable: false,
    }),
    activeState: t.exposeString("activeState", { nullable: false }),
    class: t.relation("class", { nullable: false }),
    club: t.relation("club"),
    guardians: t.relation("parentStudents", {
      nullable: true,
      authScopes: { manager: true, finance: true },
      unauthorizedResolver: () => null,
    }),
    attendances: t.relation("attendances", {
      nullable: true,
      authScopes: { manager: true, teacher: true },
      unauthorizedResolver: () => null,

      args: {
        attendanceFilter: t.arg({
          type: AttendanceFilter,
          required: true,
        }),
      },

      query: (args, ctx) => {
        const { termId, startDate, endDate } = args.attendanceFilter;

        return {
          where: {
            schoolId: ctx.schoolId!,
            termId: termId ? termId : ctx.currentTerm!,
            date: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          },
          orderBy: { date: "desc" },
        };
      },
    }),
  }),
});

builder.prismaObject("ParentStudent", {
  fields: (t) => ({
    isPrimary: t.exposeBoolean("isPrimary", { nullable: false }),
    relation: t.exposeString("relation", { nullable: false }),
    parent: t.relation("parent", {
      nullable: false,
      authScopes: { manager: true, admin: true },
    }),
    student: t.relation("student", { nullable: false }),
  }),
});

builder.queryType({
  fields: (t) => ({
    students: t.prismaField({
      type: ["Student"],
      authScopes: {
        finance: true,
        manager: true,
        admin: true,
        parent: true,
      },
      directives: {
        rateLimit: { limit: 30, duration: 3600 },
      },
      args: {
        filter: t.arg({ type: StudentFilter }),
        searchTerm: t.arg.string(),
        first: t.arg.int(),
        after: t.arg.id(),
      },
      resolve: async (query, _parent, args, ctx) => {
        const { searchTerm, filter, first, after } = args;
        const { parentId, grades } = filter ?? {};

        return await prisma.student.findMany({
          ...query,
          where: {
            schoolId: ctx.schoolId!,
            ...(searchTerm && {
              OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { surname: { contains: searchTerm, mode: "insensitive" } },
              ],
            }),
            ...(parentId && {
              parentStudents: { some: { parent: { clerkUserId: parentId } } },
            }),
            ...(grades &&
              grades.length > 0 && {
                class: { grade: { id: { in: grades } } },
              }),
          },
          take: first ?? 20,
          skip: after ? 1 : undefined,
          cursor: after ? { id: after } : undefined,
          orderBy: { createdAt: "asc" },
        });
      },
    }),

    student: t.prismaField({
      type: "Student",
      directives: {
        rateLimit: { limit: 30, duration: 3600 },
      },
      args: {
        id: t.arg.id({ required: true }),
      },
      authScopes: {
        finance: true,
        manager: true,
        admin: true,
        parent: true,
      },
      resolve: async (query, _parent, args, ctx) =>
        prisma.student.findUnique({
          ...query,
          where: {
            id: args.id,
            schoolId: ctx.schoolId!,
          },
        }),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createStudent: t.prismaField({
      type: "Student",
      args: {
        input: t.arg({ type: StudentInput, required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
        admin: true,
      },
      errors: { types: [AppError, UniqueConstraintError, ForeignKeyError] },
      resolve: async (_query, _parent, args, context) => {
        return await createStudentAction({
          ...args.input,
          slug: context.slug!,
        });
      },
    }),

    updateStudent: t.prismaField({
      type: "Student",
      authScopes: {
        authenticated: true,
        manager: true,
        admin: true,
      },
      args: {
        input: t.arg({ type: StudentInput, required: true }),
      },
      errors: {
        types: [
          AppError,
          UniqueConstraintError,
          ForeignKeyError,
          NotFoundError,
        ],
      },
      resolve: async (_query, _parent, args, context) =>
        await updateStudentAction({ ...args.input, slug: context.slug! }),
    }),
  }),
});
