import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/lib/actions";
import prisma from "@/lib/prisma";
import { builder } from "../builder";
import { AppError, NotFoundError, UniqueConstraintError } from "../errors";

const AnnouncementInput = builder.inputType("AnnouncementInput", {
  fields: (t) => ({
    id: t.id(),
    title: t.string({ required: true }),
    content: t.string({ required: true }),
    staffOnly: t.boolean({ required: true }),
    gradeId: t.string(),
  }),
});

const AnnouncementFilter = builder.inputType("AnnouncementFilter", {
  fields: (t) => ({
    termId: t.id(),
    gradeId: t.id(),
    rangeFrom: t.field({ type: "DateTime" }),
  }),
});

const Announcement = builder.prismaObject("Announcement", {
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
  fields: (t) => ({
    announcements: t.prismaField({
      type: ["Announcement"],
      authScopes: { manager: true },
      args: {
        filter: t.arg({ type: AnnouncementFilter, required: true }),
      },
      resolve: async (query, _, args, context) => {
        const { userId, accessLevel, schoolId, currentTerm } = context;
        const { termId, gradeId } = args.filter;

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

        return await prisma.announcement.findMany({
          where: {
            schoolId: schoolId!,
            termId: termId ?? currentTerm!,

            ...(accessLevel === "parent" ? { staffOnly: false } : {}),

            OR: [
              // public announcement
              { gradeId: null },

              // targeted grade
              { gradeId },

              // logged in user grade
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
          },
          ...query,
          orderBy: { publishedAt: "desc" },
        });
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createAnnouncement: t.prismaField({
      type: "Announcement",
      args: {
        input: t.arg({ type: AnnouncementInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError] },
      resolve: async (_query, _parent, args, context) => {
        const announcement = await createAnnouncementAction({
          ...args.input,
          termId: context.currentTerm!,
        });

        context.pubSub.publish("announcement:created", {
          schoolId: context.schoolId!,
          payload: announcement,
        });

        return announcement;
      },
    }),

    updateAnnouncement: t.prismaField({
      type: "Announcement",
      args: {
        input: t.arg({ type: AnnouncementInput, required: true }),
      },
      errors: { types: [AppError, UniqueConstraintError, NotFoundError] },
      resolve: async (_query, _parent, args, context) => {
        const announcement = await updateAnnouncementAction({
          ...args.input,
          termId: context.currentTerm!,
        });

        context.pubSub.publish("announcement:updated", {
          schoolId: context.schoolId!,
          payload: announcement,
        });

        return announcement;
      },
    }),
  }),
});

builder.subscriptionType({
  fields: (t) => ({
    announcementCreated: t.field({
      type: Announcement,
      nullable: false,
      subscribe: (_parent, _args, { pubSub }) => {
        return pubSub.subscribe("announcement:created");
      },
      resolve: ({ payload }) => payload,
    }),

    announcementUpdated: t.field({
      type: Announcement,
      nullable: false,
      subscribe: (_parent, _args, { pubSub }) => {
        return pubSub.subscribe("announcement:updated");
      },
      resolve: ({ payload }) => payload,
    }),
  }),
});
