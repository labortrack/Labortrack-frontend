import type { LabelHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-xs font-bold uppercase leading-4 tracking-[0.06em] text-foreground-muted", className)}
      {...props}
    />
  );
}
