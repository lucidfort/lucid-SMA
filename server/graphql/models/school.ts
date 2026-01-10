import prisma from "@/lib/prisma";
import { builder, Sex } from "../builder";

import { createSchoolAction, getSchoolAction } from "@/server/actions/school";
import { UserSex } from "@/lib/generated/prisma/enums";
import { AppError, UniqueConstraintError } from "@/server/graphql/errors";
import { subDays } from "date-fns";

export const ProgramEnum = builder.enumType("ProgramName", {
  values: ["CRECHE", "NURSERY", "PRIMARY", "SECONDARY"] as const,
});

const SchoolManagerInput = builder.inputType("SchoolManagerInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    surname: t.string({ required: true }),
    phone: t.string({ required: true }),
  }),
});

const SchoolGradeInput = builder.inputType("SchoolGradeInput", {
  fields: (t) => ({
    gradeName: t.string({ required: true }),
    programName: t.field({ type: ProgramEnum, required: true }),
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
    manager: t.field({ type: SchoolManagerInput, required: true }),
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
    activeStudentsCount: t.relationCount("students", {
      where: { status: { in: ["ACTIVE", "SUSPENDED"] } },
    }),
    activeStaffCount: t.relationCount("staffs", {
      where: { isActive: true },
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
    recentAnnouncementsCount: t.relationCount("announcements", {
      where: (_args, context) => {
        const { userId, accessLevel, schoolId } = context;

        const roleConditions = {
          teacher: {
            supervisors: {
              some: {
                teacher: {
                  clerkUserId: userId!,
                },
              },
            },
          },
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
          publishedAt: { gte: subDays(new Date(), 7) },
        };
      },
    }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    school: t.prismaField({
      type: "School",
      authScopes: {
        manager: true,
        finance: true,
        parent: true,
        teacher: true,
      },
      args: {
        id: t.arg.id({ required: true }),
      },
      resolve: async (query, _parent, { id }, context) =>
        await getSchoolAction({ id, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createSchool: t.prismaField({
      type: "School",
      args: {
        input: t.arg({ type: SchoolInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) => {
        return createSchoolAction({ input, query, context });
      },
    }),
  }),
});
