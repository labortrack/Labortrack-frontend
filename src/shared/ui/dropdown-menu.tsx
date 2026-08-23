import type { ComponentProps } from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/shared/utils/cn";

export function DropdownMenu(props: ComponentProps<typeof DropdownPrimitive.Root>) {
  return <DropdownPrimitive.Root {...props} />;
}
export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownPrimitive.Trigger>) {
  return <DropdownPrimitive.Trigger {...props} />;
}

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: ComponentProps<typeof DropdownPrimitive.Content>) {
  return <DropdownPrimitive.Portal><DropdownPrimitive.Content sideOffset={sideOffset} className={cn("z-[70] min-w-40 rounded-lg border border-border bg-card p-1 shadow-floating", className)} {...props} /></DropdownPrimitive.Portal>;
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof DropdownPrimitive.Item>) {
  return <DropdownPrimitive.Item className={cn("flex cursor-default items-center gap-2 rounded-control px-3 py-2 text-sm outline-none data-[highlighted]:bg-muted data-[disabled]:opacity-50", className)} {...props} />;
}
