import { schema } from "@/lib/pothos/schema";
import prisma from "@/lib/prisma";
import { RoleAccessLevel } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { createYoga, createPubSub } from "graphql-yoga";
import { useGraphQLSSE } from "@graphql-yoga/plugin-graphql-sse";

const pubSub = createPubSub<{
  "announcement:created": [{ schoolId: string; payload?: any }];
  "announcement:updated": [{ schoolId: string; payload?: any }];
}>();

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",

  plugins: [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGraphQLSSE(),
  ],

  graphiql: {
    subscriptionsProtocol: "GRAPHQL_SSE",
    title: "Learnix",
  },

  logging: true,

  fetchAPI: { Response },

  cors: {
    origin: process.env.NEXT_PUBLIC_BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  },

  context: async () => {
    const { userId, sessionClaims } = await auth();

    const user = sessionClaims?.metadata as {
      accessLevel?: RoleAccessLevel;
      schoolId?: string;
    };

    if (!user || !user.accessLevel || !user.schoolId) return null;

    const school = await prisma.school.findUnique({
      where: {
        id: user.schoolId,
      },
      select: {
        slug: true,
        terms: {
          where: { isCurrent: true },
          select: { id: true },
        },
      },
    });

    return {
      userId,
      schoolId: user.schoolId,
      accessLevel: user.accessLevel,
      currentTerm: school?.terms?.[0]?.id,
      slug: school?.slug,
      pubSub,
    };
  },
});

export async function GET(request: Request) {
  return yoga.handleRequest(request, {});
}

export async function POST(request: Request) {
  return yoga.handleRequest(request, {});
}
