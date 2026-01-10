import {
  assignTimetablePeriodAction,
  createTimetablePeriodAction,
  getTimetableRecordsAction,
} from "@/server/actions/timetable";

import { builder } from "@/server/graphql/builder";
import { AppError, UniqueConstraintError } from "@/server/graphql/errors";

const TimetableFilter = builder.inputType("TimetableFilter", {
  fields: (t) => ({
    classId: t.id(),
  }),
});

const TimetableAssignmentInput = builder.inputType("TimetableAssignmentInput", {
  fields: (t) => ({
    dayOfWeek: t.int({ required: true }),
    periodId: t.id({ required: true }),
    classId: t.id({ required: true }),
    subjectId: t.id(),
    teacherId: t.id(),
  }),
});

const TimetablePeriodInput = builder.inputType("TimetablePeriodInput", {
  fields: (t) => ({
    id: t.id(),
    startMinute: t.int({ required: true }),
    endMinute: t.int({ required: true }),
  }),
});

builder.prismaObject("TimetableAssignment", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    dayOfWeek: t.exposeInt("dayOfWeek", { nullable: false }),
    period: t.relation("period", { nullable: false }),
    class: t.relation("class", { nullable: false }),
    subject: t.relation("subject"),
    teacher: t.relation("teacher"),
  }),
});

builder.prismaObject("TimetablePeriod", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    startMinute: t.exposeInt("startMinute", { nullable: false }),
    endMinute: t.exposeInt("endMinute", { nullable: false }),
    assignments: t.relation("assignments", { nullable: false }),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    timetable: t.prismaField({
      type: ["TimetablePeriod"],
      args: {
        filter: t.arg({ type: TimetableFilter, required: true }),
      },
      resolve: async (query, _parent, { filter }, context) =>
        getTimetableRecordsAction({ filter, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    assignTimetablePeriod: t.prismaField({
      type: "TimetableAssignment",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: TimetableAssignmentInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await assignTimetablePeriodAction({ input, query, context }),
    }),

    createTimetablePeriod: t.prismaField({
      type: "TimetablePeriod",
      authScopes: {
        manager: true,
      },
      args: {
        input: t.arg({ type: TimetablePeriodInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createTimetablePeriodAction({ input, query, context }),
    }),
  }),
});
