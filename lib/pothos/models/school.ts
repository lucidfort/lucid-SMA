import prisma from "@/lib/prisma";
import { builder, Sex } from "../builder";

import {
  createAcademicYearAction,
  createProgramAction,
  createSchoolAction,
  createTermAction,
} from "@/lib/actions";
import { UserSex } from "@/lib/generated/prisma/enums";
import { AppError, UniqueConstraintError } from "@/lib/pothos/errors";
import { AttendanceFilter } from "./attendance";
import { Prisma } from "@/lib/generated/prisma/client";
import { RoleAccessLevel } from "@/types";

const ProgramEnum = builder.enumType("ProgramName", {
  values: ["CRECHE", "NURSERY", "PRIMARY", "SECONDARY"] as const,
});

const ManagerInput = builder.inputType("ManagerInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    surname: t.string({ required: true }),
    email: t.string({ required: true }),
    phone: t.string({ required: true }),
    birthday: t.field({ type: "DateTime", required: true }),
    username: t.string({ required: true }),
    img: t.string(),
    password: t.string({ required: true }),
  }),
});

const SchoolGradeInput = builder.inputType("SchoolGradeInput", {
  fields: (t) => ({
    gradeName: t.string({ required: true }),
    programName: t.string({ required: true }),
  }),
});

const ProgramInput = builder.inputType("ProgramInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    grades: t.stringList({ required: true }),
  }),
});

const AcademicYearInput = builder.inputType("AcademicYearInput", {
  fields: (t) => ({
    id: t.id({ required: false }),
    year: t.string({ required: true }),
    startDate: t.field({ type: "DateTime", required: true }),
    endDate: t.field({ type: "DateTime" }),
    isCurrent: t.boolean({ required: true }),
  }),
});

const TermInput = builder.inputType("TermInput", {
  fields: (t) => ({
    id: t.id({ required: false }),
    academicYearId: t.id({ required: true }),
    term: t.string({ required: true }),
    startDate: t.field({ type: "DateTime", required: true }),
    endDate: t.field({ type: "DateTime" }),
    isCurrent: t.boolean({ required: true }),
  }),
});

const SchoolInput = builder.inputType("SchoolInput", {
  fields: (t) => ({
    slug: t.string({ required: true }),
    name: t.string({ required: true }),
    email: t.string({ required: true }),
    phone: t.string({ required: true }),
    address: t.string({ required: true }),
    motto: t.string(),
    logo: t.string(),
    programs: t.field({ type: [ProgramEnum], required: true }),
    grades: t.field({ type: [SchoolGradeInput], required: true }),
    manager: t.field({ type: ManagerInput, required: true }),
  }),
});

const StudentSexCountRef = builder.objectRef<{ sex: UserSex; _count: number }>(
  "StudentSexCount",
);

builder.objectType(StudentSexCountRef, {
  fields: (t) => ({
    sex: t.field({
      type: Sex,
      resolve: (parent) => parent.sex,
    }),
    _count: t.int({
      resolve: (parent) => parent._count,
    }),
  }),
});

builder.prismaObject("School", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    slug: t.exposeString("slug", { nullable: false }),
    email: t.exposeString("email", { nullable: false }),
    phone: t.exposeString("phone", { nullable: false }),
    motto: t.exposeString("motto"),
    logo: t.exposeString("logo"),
    programs: t.relation("programs"),
    classes: t.relation("classes"),
    currentTerm: t.relation("terms", {
      query: {
        where: { isCurrent: true },
      },
    }),
    studentAttendances: t.relation("studentAttendances", {
      authScopes: {
        manager: true,
        teacher: true,
        admin: true,
      },
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
    activeStudentsCount: t.relationCount("students", {
      where: { activeState: { in: ["ACTIVE", "SUSPENDED"] } },
    }),
    activeStaffCount: t.relationCount("staffs", {
      where: {
        isActive: true,
      },
    }),
    studentSexDistribution: t.field({
      type: [StudentSexCountRef],
      nullable: false,
      resolve: async (school) => {
        const data = (await prisma.student.groupBy({
          where: { schoolId: school.id },
          by: ["sex"],
          _count: true,
        })) as { _count: number; sex: UserSex }[];

        return data.map((item) => ({
          sex: item.sex,
          _count: item._count,
        }));
      },
    }),
    announcementsCount: t.relationCount("announcements", {
      args: {
        rangeFrom: t.arg({ type: "DateTime", required: true }),
      },
      where: (args, context) => {
        const { userId, accessLevel, schoolId, currentTerm } = context;

        const roleConditions = {
          teacher: { supervisors: { some: { clerkUserId: userId! } } },
          parent: {
            students: {
              some: {
                parentStudents: {
                  some: { parent: { clerkUserId: userId! } },
                },
              },
            },
          },
        };
        return {
          schoolId: schoolId!,
          OR: [
            { gradeId: null },
            {
              grade: {
                classes: {
                  some: {
                    ...roleConditions[
                      accessLevel as keyof typeof roleConditions
                    ],
                  },
                },
              },
            },
          ],
          termId: currentTerm!,
          publishedAt: { gte: args.rangeFrom },
        };
      },
    }),
  }),
});

builder.prismaObject("Program", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    name: t.expose("name", { type: ProgramEnum, nullable: false }),
    grades: t.relation("grades", { nullable: false }),
  }),
});

builder.prismaObject("AcademicYear", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    year: t.exposeString("year", { nullable: false }),
    startDate: t.expose("startDate", { type: "DateTime", nullable: false }),
    endDate: t.expose("endDate", { type: "DateTime" }),
    isCurrent: t.exposeBoolean("isCurrent", { nullable: false }),
    terms: t.relation("terms", { nullable: false }),
  }),
});

builder.prismaObject("Term", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    term: t.exposeInt("term", { nullable: false }),
    startDate: t.expose("startDate", { type: "DateTime", nullable: false }),
    endDate: t.expose("endDate", { type: "DateTime" }),
    isCurrent: t.exposeBoolean("isCurrent", { nullable: false }),
    academicYear: t.relation("academicYear", { nullable: false }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createSchool: t.prismaField({
      type: "School",
      args: {
        input: t.arg({ type: SchoolInput, required: true }),
      },
      authScopes: {
        public: true,
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) => {
        return createSchoolAction(args.input);
      },
    }),

    createProgram: t.prismaField({
      type: "Program",
      args: {
        input: t.arg({ type: ProgramInput, required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
        admin: true,
      },
      errors: { types: [AppError] },
      resolve: async (_query, _parent, args) => {
        return createProgramAction(args.input);
      },
    }),

    mutateAcademicYear: t.prismaField({
      type: "AcademicYear",
      args: {
        input: t.arg({ type: AcademicYearInput, required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
        admin: true,
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createAcademicYearAction(args.input),
    }),

    mutateTerm: t.prismaField({
      type: "Term",
      args: {
        input: t.arg({ type: TermInput, required: true }),
      },
      authScopes: {
        authenticated: true,
        manager: true,
        admin: true,
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) =>
        await createTermAction(args.input),
    }),
  }),
});

builder.queryType({
  fields: (t) => ({
    school: t.prismaField({
      type: "School",
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _, args, context) => {
        const { accessLevel, userId } = context;
        let where: Prisma.SchoolWhereInput;

        switch (accessLevel as RoleAccessLevel) {
          case "parent":
            where = { parents: { some: { clerkUserId: userId } } };
            break;
          case "manager":
            where = { managers: { some: { clerkUserId: userId } } };
            break;
          case "finance":
          case "academics":
          case "administration":
          case "teacher":
            where = { staffs: { some: { clerkUserId: userId } } };
            break;
          default:
            where = {
              OR: [
                { parents: { some: { clerkUserId: userId } } },
                { staffs: { some: { clerkUserId: userId } } },
              ],
            };
        }

        return await prisma.school.findFirst({
          ...query,
          where: {
            id: args.id,
            ...where,
          },
        });
      },
    }),

    schools: t.prismaField({
      type: ["School"],
      resolve: (query) => prisma.school.findMany({ ...query }),
    }),

    programs: t.prismaField({
      type: ["Program"],
      resolve: async (query, _parent, _args, ctx) =>
        prisma.program.findMany({
          ...query,
          where: { schoolId: ctx.schoolId! },
        }),
    }),

    academicYears: t.prismaField({
      type: ["AcademicYear"],
      resolve: async (query, _parent, _args, ctx) =>
        prisma.academicYear.findMany({
          ...query,
          where: {
            schoolId: ctx.schoolId!,
          },
        }),
    }),

    terms: t.prismaField({
      type: ["Term"],
      args: {
        take: t.arg.int({ required: false }),
      },
      resolve: async (query, _parent, args, ctx) =>
        prisma.term.findMany({
          ...query,
          where: {
            schoolId: ctx.schoolId!,
          },
          ...(args?.take && { take: args.take }),
        }),
    }),
  }),
});
