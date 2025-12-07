import prisma from "@/lib/prisma";
import { builder, Sex } from "../builder";

import { createProgramAction, createSchoolAction } from "@/lib/actions";
import { Prisma } from "@/lib/generated/prisma/client";
import { UserSex } from "@/lib/generated/prisma/enums";
import { AppError, UniqueConstraintError } from "@/lib/pothos/errors";
import { RoleAccessLevel } from "@/types";
import { AttendanceFilter } from "./attendance";

const ProgramEnum = builder.enumType("ProgramName", {
  values: ["CRECHE", "NURSERY", "PRIMARY", "SECONDARY"] as const,
});

const ManagerInput = builder.inputType("ManagerInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    surname: t.string({ required: true }),
    email: t.string({ required: true }),
    phone: t.string({ required: true }),
    username: t.string({ required: true }),
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
        filter: t.arg({
          type: AttendanceFilter,
          required: true,
        }),
      },
      query(args, ctx) {
        const { termId, startDate, endDate } = args.filter;

        return {
          where: {
            schoolId: ctx.schoolId!,
            termId: termId ?? ctx.currentTerm!,
            date: {
              gte: new Date(startDate),
              ...(endDate && { lte: new Date(endDate) }),
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
        let where: Prisma.SchoolWhereInput = {};

        if (accessLevel && userId) {
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
  }),
});
