import type { HTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export function Avatar({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white",
        className,
      )}
      {...props}
    />
  );
}
