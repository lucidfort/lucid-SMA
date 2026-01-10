"use client";

import { useEffect, useState } from "react";

const RateLimitNotice = ({ retryAfter }: { retryAfter: number }) => {
  const [seconds, setSeconds] = useState(retryAfter);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Slow down, speedster 🐢</h1>
      <p className="text-muted-foreground max-w-md">
        You’ve hit a temporary request limit. This usually happens when too many
        actions are performed in a short time.
      </p>
      <p className="text-lg font-medium">
        Try again in <span className="font-mono">{seconds}s</span>
      </p>
    </div>
  );
};

export default RateLimitNotice;
