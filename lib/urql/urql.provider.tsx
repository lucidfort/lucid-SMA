"use client";

import { Client, UrqlProvider as Provider, SSRExchange } from "@urql/next";
import { ReactNode, useEffect, useState } from "react";

export function UrqlProvider({ children }: { children: ReactNode }) {
  const [clientBundle, setClientBundle] = useState<{
    client: Client;
    ssr: SSRExchange;
  } | null>(null);

  useEffect(() => {
    const setup = async () => {
      if (typeof window !== "undefined") {
        const { createUrqlClient } = await import("./browser.client");
        const { client, ssr } = createUrqlClient();
        setClientBundle({ client, ssr });
      }
    };

    setup();
  }, []);

  if (!clientBundle) return <div className="sr-only">Loading...</div>;

  return (
    <Provider client={clientBundle.client} ssr={clientBundle.ssr}>
      {children}
    </Provider>
  );
}
