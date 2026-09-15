import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

export const SearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { containerClassName?: string }
>(function SearchInput({ className, containerClassName, ...props }, ref) {
  return (
    <div className={cn("relative", containerClassName || (className?.includes("flex-1") ? "flex-1" : undefined))}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
      <Input ref={ref} className={cn("pl-9", className)} {...props} />
    </div>
  );
});
