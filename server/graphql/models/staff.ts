import {
  assignClassAction,
  assignSubjectAction,
  createStaffAction,
  deactivateStaffAction,
  getStaffAction,
  getStaffsAction,
  updateStaffAction,
} from "@/server/actions/staff";
import {
  AppError,
  ForeignKeyError,
  UniqueConstraintError,
} from "@/server/graphql/errors";
import { builder, Sex } from "../builder";
import { AttendanceFilter } from "@/server/graphql/models/attendance";

const AccessLevel = builder.enumType("AccessLevel", {
  values: ["FINANCE", "ACADEMICS", "ADMINISTRATION", "TEACHER", "RESTRICTED"],
});

const ContractType = builder.enumType("ContractType", {
  values: ["CONTRACT", "PART_TIME", "PERMANENT"],
});

const StaffFilter = builder.inputType("StaffFilter", {
  fields: (t) => ({
    isActive: t.boolean({ required: true }),
    accessLevel: t.field({ type: AccessLevel }),
    classId: t.string(),
    searchTerm: t.string(),
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
    isActive: t.boolean({ required: true, defaultValue: true }),
    hireDate: t.field({ type: "DateTime" }),
    oldImg: t.string(),
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
    birthday: t.expose("birthday", { type: "DateTime", nullable: false }),
    img: t.exposeString("img"),
    clerkUserId: t.exposeString("clerkUserId"),
    accessLevel: t.expose("accessLevel", {
      type: AccessLevel,
      nullable: false,
    }),
    contractType: t.expose("contractType", {
      type: ContractType,
      nullable: false,
    }),
    isActive: t.exposeBoolean("isActive", { nullable: false }),
    subjects: t.relation("teacherSubjectAssignments"),
    assignedClass: t.relation("classes"),
    payrollProfile: t.relation("payrollProfile", {
      query: (_args, context) => ({
        where: { schoolId: context.schoolId! },
      }),
    }),
    attendances: t.relation("attendances", {
      nullable: false,
      authScopes: { manager: true },
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
            ...(startDate || endDate
              ? {
                  date: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: new Date(endDate) }),
                  },
                }
              : {}),
          },
          orderBy: { date: "desc" },
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
    staffs: t.prismaField({
      type: ["Staff"],
      authScopes: {
        manager: true,
      },
      args: {
        filter: t.arg({ type: StaffFilter }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getStaffsAction({ filter, query, context }),
    }),

    staff: t.prismaField({
      type: "Staff",
      authScopes: {
        manager: true,
        teacher: true,
        finance: true,
      },
      args: {
        id: t.arg.id(),
        clerkUserId: t.arg.string(),
      },
      resolve: async (query, _parent, args, context) =>
        await getStaffAction({ filter: args, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createStaff: t.prismaField({
      type: "Staff",
      authScopes: {
        manager: true,
      },
      args: { input: t.arg({ type: StaffInput, required: true }) },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) => {
        return await createStaffAction({ input, query, context });
      },
    }),

    updateStaff: t.prismaField({
      type: "Staff",
      authScopes: {
        manager: true,
      },
      args: { input: t.arg({ type: StaffInput, required: true }) },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) => {
        return await updateStaffAction({ input, query, context });
      },
    }),

    deactivateStaff: t.boolean({
      authScopes: {
        manager: true,
      },
      args: {
        staffId: t.arg.id({ required: true }),
        clerkUserId: t.arg.id(),
        activate: t.arg.boolean({ required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_parent, args, context) => {
        return await deactivateStaffAction({ ...args, context });
      },
    }),

    assignSubject: t.prismaField({
      type: ["TeacherSubjectAssignment"],
      authScopes: {
        manager: true,
      },
      args: {
        staffId: t.arg.id({ required: true }),
        subjectId: t.arg.id({ required: true }),
        grades: t.arg.idList({ required: true }),
      },
      errors: { types: [AppError, ForeignKeyError] },
      resolve: async (query, _parent, args, context) =>
        await assignSubjectAction({ ...args, query, context }),
    }),

    assignClass: t.prismaField({
      type: "ClassSupervisor",
      authScopes: {
        manager: true,
      },
      args: {
        staffId: t.arg.id({ required: true }),
        classId: t.arg.id({ required: true }),
      },
      errors: { types: [AppError, ForeignKeyError] },
      resolve: async (query, _parent, args, context) =>
        await assignClassAction({ ...args, query, context }),
    }),
  }),
});
