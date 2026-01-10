import { cn } from "@/lib/utils/client.utils";
import React from "react";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md border-gray-500 bg-accent",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
