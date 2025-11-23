import { createStaffAction, updateStaffAction } from "@/lib/actions";
import { AppError, UniqueConstraintError } from "@/lib/pothos/errors";
import prisma from "@/lib/prisma";
import { builder, Sex } from "../builder";
import { AttendanceFilter } from "./attendance";

const AccessLevel = builder.enumType("AccessLevel", {
  values: ["FINANCE", "ACADEMICS", "ADMINISTRATION", "TEACHER", "RESTRICTED"],
});

const ContractType = builder.enumType("ContractType", {
  values: ["CONTRACT", "PART_TIME", "PERMANENT"],
});

const StaffFilterInput = builder.inputType("StaffFilterInput", {
  fields: (t) => ({
    isFormTeacher: t.boolean({ required: false }),
    isActive: t.boolean({ required: true }),
    accessLevel: t.field({ type: AccessLevel }),
    classId: t.string(),
  }),
});

const SubjectGradesInput = builder.inputType("SubjectGradesInput", {
  fields: (t) => ({
    subjectId: t.string({ required: true }),
    gradeIds: t.stringList({ required: true }),
  }),
});

const StaffInput = builder.inputType("StaffInput", {
  fields: (t) => ({
    id: t.string(),
    clerkUserId: t.string(),
    employeeId: t.string({ required: true }),
    name: t.string({ required: true }),
    surname: t.string({ required: true }),
    email: t.field({ type: "Email" }),
    password: t.string(),
    phone: t.string({ required: true }),
    address: t.string({ required: true }),
    img: t.string(),
    birthday: t.field({ type: "DateTime", required: true }),
    sex: t.field({ type: Sex, required: true }),
    contractType: t.field({ type: ContractType, required: true }),
    accessLevel: t.field({ type: AccessLevel, required: true }),
    role: t.string({ required: true }),
    isFormTeacher: t.boolean({ required: true, defaultValue: false }),
    isActive: t.boolean({ required: true, defaultValue: true }),
    hireDate: t.field({ type: "DateTime" }),
    oldImg: t.string(),
    classId: t.string(),
    assignments: t.field({ type: SubjectGradesInput }),
  }),
});

builder.prismaObject("Staff", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    employeeId: t.exposeString("employeeId", { nullable: false }),
    name: t.exposeString("name", { nullable: false }),
    surname: t.exposeString("surname", { nullable: false }),
    role: t.exposeString("role", { nullable: false }),
    sex: t.expose("sex", { type: Sex, nullable: false }),
    phone: t.exposeString("phone", { nullable: false }),
    email: t.expose("email", { type: "Email" }),
    address: t.exposeString("address", { nullable: false }),
    img: t.exposeString("img"),
    clerkUserId: t.exposeString("clerkUserId"),
    accessLevel: t.exposeString("accessLevel", { nullable: false }),
    subjects: t.relation("teacherSubjectAssignments"),
    class: t.relation("class"),
    attendances: t.relation("attendances", {
      nullable: false,
      authScopes: {
        manager: true,
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
              gte: startDate,
              ...(endDate && { lte: endDate }),
            },
          },
          orderBy: { date: "desc" },
        };
      },
    }),
  }),
});

builder.queryType({
  fields: (t) => ({
    staffs: t.prismaField({
      type: ["Staff"],
      args: {
        filter: t.arg({ type: StaffFilterInput, required: false }),
        // attendanceFilter: t.arg
      },
      resolve: async (query, _parent, args, ctx) => {
        const { isFormTeacher, isActive, accessLevel, classId } =
          args?.filter ?? {};

        return prisma.staff.findMany({
          where: {
            schoolId: ctx.schoolId!,
            isActive,
            classId,
            ...(accessLevel && { accessLevel }),
            ...(isFormTeacher && { isFormTeacher }),
          },
          ...query,
        });
      },
    }),

    staff: t.prismaField({
      type: "Staff",
      args: {
        id: t.arg.id({ required: false }),
        clerkUserId: t.arg.string({ required: false }),
      },
      resolve: async (query, _parent, args, ctx) => {
        return prisma.staff.findUnique({
          ...query,
          where: {
            schoolId: ctx.schoolId!,
            ...(args.id
              ? { id: args.id! }
              : { clerkUserId: args.clerkUserId! }),
          },
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createStaff: t.prismaField({
      type: "Staff",
      args: { input: t.arg({ type: StaffInput, required: true }) },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args, context) => {
        return await createStaffAction({ ...args.input, slug: context.slug! });
      },
    }),

    updateStaff: t.prismaField({
      type: "Staff",
      args: { input: t.arg({ type: StaffInput, required: true }) },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args, context) => {
        return await updateStaffAction({ ...args.input, slug: context.slug! });
      },
    }),
  }),
});
