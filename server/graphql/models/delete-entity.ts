import { builder } from "@/server/graphql/builder";
import { AppError, AuthenticationError } from "@/server/graphql/errors";
import { deleteEntityAction } from "@/server/actions/delete-entity";

const TableEnum = builder.enumType("Table", {
  values: {
    STAFF: { value: "staff" },
    STUDENT: { value: "student" },
    PARENT: { value: "parent" },
    SUBJECT: { value: "subject" },
    CLASS: { value: "class" },
    EXAM: { value: "exam" },
    ASSIGNMENT: { value: "assignment" },
    EXAM_RESULT: { value: "exam-result" },
    ASSESSMENT_RESULT: { value: "assessment-result" },
    ATTENDANCE: { value: "attendance" },
    EVENT: { value: "event" },
    ANNOUNCEMENT: { value: "announcement" },
    GRADE: { value: "grade" },
    PROGRAM: { value: "program" },
    TIMETABLE: { value: "timetable" },
    TERM: { value: "term" },
    ACADEMIC_YEAR: { value: "academic-year" },
    INVOICE: { value: "invoice" },
    TRANSACTION: { value: "transaction" },
    PAYROLL_PROFILE: { value: "payroll-profile" },
    PAYROLL_TRANSACTION: { value: "payroll-transaction" },
    CLASS_ASSIGNMENT: { value: "class-assignment" },
  },
});

const DeleteEntityResponse = builder.objectRef<{
  success: boolean;
}>("DeleteEntityResponse");

DeleteEntityResponse.implement({
  fields: (t) => ({
    success: t.exposeBoolean("success", { nullable: false }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    deleteEntity: t.field({
      type: DeleteEntityResponse,
      authScopes: {
        authenticated: true,
        manager: true,
      },
      args: {
        id: t.arg.id({ required: true }),
        table: t.arg({ type: TableEnum, required: true }),
      },
      errors: { types: [AppError, AuthenticationError] },
      resolve: async (_parent, { id, table }, context) =>
        deleteEntityAction({ id, table, context }),
    }),
  }),
});
