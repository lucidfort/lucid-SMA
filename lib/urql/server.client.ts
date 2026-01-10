import {
  Client,
  cacheExchange,
  errorExchange,
  fetchExchange,
  ssrExchange,
  subscriptionExchange,
} from "@urql/next";
import { cookies } from "next/headers";
import { createClient as createSSEClient } from "graphql-sse";

export async function createUrqlServerClient() {
  const credentials = await cookies();

  const ssr = ssrExchange({
    isClient: false,
  });

  const sseClient = createSSEClient({
    url: `${process.env.NEXT_PUBLIC_GRAPHQL_URL!}`,
  });

  const client = new Client({
    url: process.env.NEXT_PUBLIC_GRAPHQL_URL!,

    exchanges: [
      errorExchange({}),
      ssr,
      cacheExchange,
      fetchExchange,
      subscriptionExchange({
        forwardSubscription(operation) {
          const input = { ...operation, query: operation.query || "" };

          return {
            subscribe(sink) {
              const dispose = sseClient.subscribe(input, sink);
              return { unsubscribe: dispose };
            },
          };
        },
      }),
    ],

    requestPolicy: "cache-and-network",
    preferGetMethod: false,

    fetchOptions: {
      credentials: "include",
      cache: "no-store",
      headers: {
        cookie: credentials.toString(),
      },
    },
  });

  return {
    client,
    ssr,
  };
}
