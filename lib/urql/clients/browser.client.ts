import introspectedSchema from "@/introspectedSchema.json";
import { Data, offlineExchange } from "@urql/exchange-graphcache";
import {
  Client,
  errorExchange,
  fetchExchange,
  ssrExchange,
  subscriptionExchange,
} from "@urql/next";
import { clientStorage } from "./browser.storage";
import { createClient as createSSEClient } from "graphql-sse";

export function createUrqlClient() {
  const cache = offlineExchange({
    schema: introspectedSchema,
    storage: clientStorage,
    keys: {
      StudentSexCount: (data: Data & { sex?: string }) => data.sex ?? null,
      StudentAttendance: () => null,
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

    requestPolicy: "cache-first",
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
