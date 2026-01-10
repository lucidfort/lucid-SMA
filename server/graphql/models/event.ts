import {
  createEventAction,
  getEventsAction,
  updateEventAction,
} from "@/server/actions/event";
import { builder } from "../builder";
import { AppError, NotFoundError, UniqueConstraintError } from "../errors";

const EventInput = builder.inputType("EventInput", {
  fields: (t) => ({
    id: t.id(),
    title: t.string({ required: true }),
    description: t.string({ required: true }),
    date: t.field({ type: "DateTime", required: true }),
    gradeId: t.id(),
  }),
});

const EventFilter = builder.inputType("EventFilter", {
  fields: (t) => ({
    gradeId: t.id(),
    termId: t.id(),
    date: t.field({ type: "DateTime" }),
    take: t.int(),
  }),
});

builder.prismaObject("Event", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    title: t.exposeString("title", { nullable: false }),
    description: t.exposeString("description"),
    date: t.expose("date", { type: "DateTime", nullable: false }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    grade: t.relation("grade"),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    events: t.prismaField({
      type: ["Event"],
      args: {
        filter: t.arg({ type: EventFilter, required: true }),
      },
      resolve: async (query, _, { filter }, context) =>
        await getEventsAction({ filter, query, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
    manager: true,
  },
  fields: (t) => ({
    createEvent: t.prismaField({
      type: "Event",
      args: {
        input: t.arg({ type: EventInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createEventAction({ input, query, context }),
    }),

    updateEvent: t.prismaField({
      type: "Event",
      args: {
        input: t.arg({ type: EventInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (query, _parent, { input }, context) =>
        await updateEventAction({ input, query, context }),
    }),
  }),
});
