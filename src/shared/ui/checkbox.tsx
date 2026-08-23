import type { ComponentProps } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root className={cn("flex size-4 items-center justify-center rounded-[3px] border border-border-strong bg-card outline-none focus:ring-2 focus:ring-primary/20 data-[state=checked]:border-primary data-[state=checked]:bg-primary", className)} {...props}>
      <CheckboxPrimitive.Indicator><Check className="size-3 text-white" /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
