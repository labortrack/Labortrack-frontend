import type { ComponentProps } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/shared/utils/cn";

export function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}
export function PopoverTrigger(
  props: ComponentProps<typeof PopoverPrimitive.Trigger>,
) {
  return <PopoverPrimitive.Trigger {...props} />;
}

export function PopoverContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-[70] rounded-lg border border-border bg-card p-4 shadow-floating",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
