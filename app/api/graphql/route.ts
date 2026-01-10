import { schema } from "@/server/graphql/schema";
import prisma from "@/lib/prisma";
import { RoleAccessLevel } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { createYoga } from "graphql-yoga";
import { useGraphQLSSE } from "@graphql-yoga/plugin-graphql-sse";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",

  plugins: [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGraphQLSSE(),
  ],

  graphiql: {
    subscriptionsProtocol: "GRAPHQL_SSE",
    title: "Eduvia",
  },

  logging: true,

  fetchAPI: { Response },

  cors: {
    origin: ["http://localhost:3000", "https://learnix.plugnpros.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type", "Authorization"],
  },

  context: async () => {
    const { userId, sessionClaims } = await auth();

    const metadata = sessionClaims?.metadata as {
      accessLevel?: RoleAccessLevel;
      schoolId?: string;
    };

    if (!userId || !metadata?.accessLevel || !metadata?.schoolId) {
      return {
        userId,
        schoolId: metadata?.schoolId,
        accessLevel: metadata?.accessLevel,
        currentTerm: null,
        slug: null,
      };
    }

    const school = await prisma.school.findUnique({
      where: { id: metadata.schoolId },
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
      schoolId: metadata.schoolId,
      accessLevel: metadata.accessLevel,
      currentTerm: school?.terms?.[0]?.id ?? null,
      slug: school?.slug ?? null,
    };
  },
});

export async function GET(request: Request) {
  return yoga.handleRequest(request, {});
}

export async function POST(request: Request) {
  return yoga.handleRequest(request, {});
}
