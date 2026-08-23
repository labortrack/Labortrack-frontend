import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/ui";

export const SearchInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function SearchInput(props, ref) {
    return <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" /><Input ref={ref} className="pl-9" {...props} /></div>;
  },
);
