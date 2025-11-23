import { createEventAction, updateEventAction } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { builder } from "../builder";
import { AppError, NotFoundError, UniqueConstraintError } from "../errors";

const EventGroupEnum = builder.enumType("EventGroupEnum", {
  values: ["PUBLIC", "STAFF"],
});

const EventInput = builder.inputType("EventInput", {
  fields: (t) => ({
    id: t.id(),
    title: t.string({ required: true }),
    description: t.string({ required: true }),
    startTime: t.field({ type: "DateTime", required: true }),
    endTime: t.field({ type: "DateTime", required: true }),
    gradeId: t.string(),
  }),
});

export const EventFilter = builder.inputType("EventFilter", {
  fields: (t) => ({
    gradeId: t.id(),
    termId: t.id(),
    startTime: t.field({ type: "DateTime", required: true }),
    endTime: t.field({ type: "DateTime" }),
  }),
});

builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    title: t.exposeString("title", { nullable: false }),
    group: t.expose("group", { type: EventGroupEnum, nullable: false }),
    description: t.exposeString("description", { nullable: false }),
    startTime: t.expose("startTime", { type: "DateTime", nullable: false }),
    endTime: t.expose("endTime", { type: "DateTime", nullable: false }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    grade: t.relation("grade"),
  }),
});

builder.queryType({
  fields: (t) => ({
    events: t.prismaField({
      type: ["Event"],
      args: {
        filter: t.arg({ type: EventFilter, required: true }),
      },
      resolve: async (query, _, args, context) => {
        const { userId, accessLevel, schoolId, currentTerm } = context;
        const { startTime, endTime, termId, gradeId } = args.filter;

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

        return await prisma.event.findMany({
          where: {
            schoolId: schoolId!,
            termId: termId ?? currentTerm!,
            OR: [
              { gradeId: null },
              { gradeId: gradeId },
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
            startTime: {
              gte: startTime,
              ...(endTime && { lte: endTime }),
            },
          },

          ...query,
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createEvent: t.prismaField({
      type: "Event",
      args: {
        input: t.arg({ type: EventInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args) => {
        return createEventAction(args.input);
      },
    }),

    updateEvent: t.prismaField({
      type: "Event",
      args: {
        input: t.arg({ type: EventInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (_query, _parent, args) => {
        return updateEventAction(args.input);
      },
    }),
  }),
});
