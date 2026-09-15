import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-control border border-border-strong bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-foreground-muted/75 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-subtle disabled:text-foreground-muted aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/15",
        className,
      )}
      {...props}
    />
  );
});
