import {
  createAnnouncementAction,
  getAnnouncementsAction,
  updateAnnouncementAction,
} from "@/server/actions/announcement";
import { builder } from "../builder";
import { AppError, NotFoundError, UniqueConstraintError } from "../errors";

const AnnouncementInput = builder.inputType("AnnouncementInput", {
  fields: (t) => ({
    id: t.id(),
    title: t.string({ required: true }),
    content: t.string({ required: true }),
    staffOnly: t.boolean({ required: true }),
    gradeId: t.id(),
  }),
});

const AnnouncementFilter = builder.inputType("AnnouncementFilter", {
  fields: (t) => ({
    academicYearId: t.id(),
    termId: t.id(),
    gradeId: t.id(),
    rangeFrom: t.field({ type: "DateTime" }),
    take: t.int(),
  }),
});

builder.prismaObject("Announcement", {
  fields: (t) => ({
    id: t.exposeID("id", { nullable: false }),
    title: t.exposeString("title", { nullable: false }),
    content: t.exposeString("content", { nullable: false }),
    publishedAt: t.expose("publishedAt", { type: "DateTime", nullable: false }),
    gradeId: t.exposeID("gradeId"),
    grade: t.relation("grade"),
  }),
});

builder.queryType({
  authScopes: {
    authenticated: true,
  },
  fields: (t) => ({
    announcements: t.prismaField({
      type: ["Announcement"],
      authScopes: { manager: true },
      args: {
        filter: t.arg({ type: AnnouncementFilter, required: true }),
        take: t.arg.int(),
      },
      resolve: async (query, _, { filter }, context) =>
        await getAnnouncementsAction({ query, filter, context }),
    }),
  }),
});

builder.mutationType({
  authScopes: {
    authenticated: true,
    manager: true,
  },
  fields: (t) => ({
    createAnnouncement: t.prismaField({
      type: "Announcement",
      args: {
        input: t.arg({ type: AnnouncementInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (query, _parent, { input }, context) =>
        await createAnnouncementAction({ input, query, context }),
    }),

    updateAnnouncement: t.prismaField({
      type: "Announcement",
      args: {
        input: t.arg({ type: AnnouncementInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (query, _parent, { input }, context) =>
        await updateAnnouncementAction({ input, query, context }),
    }),
  }),
});
