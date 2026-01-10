import { rateLimitDirective } from "graphql-rate-limit-directive";
import { builder } from "@/server/graphql/builder";
import { GraphQLError } from "graphql";

import "./models";

type Context = {
  userId: string | null;
  schoolId: string | null;
  accessLevel: number;
};

const { rateLimitDirectiveTransformer } = rateLimitDirective({
  onLimit: (response, _directiveArgs, _source, _args, context: Context) => {
    const seconds = Math.ceil(response.msBeforeNext / 1000);

    console.warn(
      `Rate limit exceeded for user ${context.userId || "anonymous"} — try again in ${seconds}s`,
    );

    return new GraphQLError(
      `Too many requests. Try again in ${seconds} seconds.`,
      {
        extensions: {
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: seconds,
        },
      },
    );
  },
  keyGenerator: (_directiveArgs, _source, _args, context: Context) => {
    return context.userId || "anonymous";
  },
});

export const schema = rateLimitDirectiveTransformer(builder.toSchema());
