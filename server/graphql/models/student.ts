import {
  createStudentAction,
  getStudentAction,
  getStudentsAction,
  updateStudentAction,
} from "@/server/actions/student";
import { builder, Sex } from "../builder";
import { AppError, ForeignKeyError, UniqueConstraintError } from "../errors";
import { AttendanceFilter } from "./attendance";

const StudentStatus = builder.enumType("StudentStatus", {
  values: [
    "ACTIVE",
    "SUSPENDED",
    "GRADUATED",
    "TRANSFERRED",
    "WITHDRAWN",
    "EXPELLED",
  ],
});

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
    gradeId: t.id(),
    grades: t.idList(),
    classId: t.id(),
    searchTerm: t.string(),
    status: t.field({ type: [StudentStatus] }),
    take: t.int(),
    skip: t.int(),
  }),
});

builder.prismaObject("Student", {
  authScopes: {
    authenticated: true,
  },
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
    status: t.expose("status", { type: StudentStatus, nullable: false }),
    classId: t.exposeString("classId", { nullable: false }),
    class: t.relation("class", { nullable: false }),
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
        filter: t.arg({
          type: AttendanceFilter,
          required: true,
        }),
      },
      query: (args, context) => {
        const { termId, startDate, endDate } = args.filter;

        return {
          where: {
            schoolId: context.schoolId!,
            termId: termId ?? context.currentTerm!,

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

builder.prismaObject("ParentStudent", {
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    isPrimary: t.exposeBoolean("isPrimary", { nullable: false }),
    relation: t.exposeString("relation", { nullable: false }),
    parent: t.relation("parent", {
      nullable: false,
      authScopes: { manager: true },
    }),
    student: t.relation("student", { nullable: false }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    students: t.prismaField({
      type: ["Student"],
      authScopes: {
        manager: true,
        parent: true,
        teacher: true,
      },
      args: {
        filter: t.arg({ type: StudentFilter }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        await getStudentsAction({ filter, query, context }),
    }),

    student: t.prismaField({
      type: "Student",
      args: {
        id: t.arg.id({ required: true }),
      },
      authScopes: {
        manager: true,
        finance: true,
        parent: true,
      },
      resolve: async (query, _parent, { id }, context) =>
        await getStudentAction({ id, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    createStudent: t.prismaField({
      type: "Student",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: StudentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, ForeignKeyError] },
      resolve: async (query, _parent, { input }, context) =>
        await createStudentAction({ input, query, context }),
    }),

    updateStudent: t.prismaField({
      type: "Student",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: StudentInput, required: true }),
      },
      errors: {
        types: [AppError, UniqueConstraintError, ForeignKeyError],
      },
      resolve: async (query, _parent, { input }, context) =>
        await updateStudentAction({ input, query, context }),
    }),
  }),
});
