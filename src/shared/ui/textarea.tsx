import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full resize-y rounded-control border border-border-strong bg-card px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground-muted/75 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-subtle aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/15",
        className,
      )}
      {...props}
    />
  );
});
