import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-control bg-muted", className)} {...props} />;
}
