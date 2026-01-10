import introspectedSchema from "@/introspectedSchema.json";
import { Data, offlineExchange } from "@urql/exchange-graphcache";
import {
  Client,
  errorExchange,
  fetchExchange,
  ssrExchange,
  subscriptionExchange,
} from "@urql/next";
import { createClient as createSSEClient } from "graphql-sse";
import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage";

export function createUrqlClient() {
  const clientStorage = makeDefaultStorage({
    idbName: "urql-cache",
    maxAge: 7,
  });

  const cache = offlineExchange({
    schema: introspectedSchema,
    storage: clientStorage,
    keys: {
      StudentSexCount: (data: Data & { sex?: string }) => data.sex ?? null,
      ClassAttendance: () => null,
    },
  });

  const sseClient = createSSEClient({
    url: "/api/graphql",
  });

  const ssr = ssrExchange({
    isClient: true,
  });

  const client = new Client({
    url: "/api/graphql",

    exchanges: [
      cache,
      errorExchange({
        onError(error) {
          if (error?.graphQLErrors.length > 0) {
            console.log("ErrorExchange: ", error);
          }
        },
      }),
      ssr,
      fetchExchange,
      subscriptionExchange({
        forwardSubscription(operation) {
          const input = { ...operation, query: operation.query || "" };

          return {
            subscribe: (sink) => {
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
    },
  });

  return {
    client,
    ssr,
  };
}
