"use client";

import { makeDefaultStorage } from "@urql/exchange-graphcache/default-storage";

export const clientStorage = makeDefaultStorage({
  idbName: "urql-cache",
  maxAge: 7,
});
