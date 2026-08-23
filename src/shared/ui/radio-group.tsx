import type { ComponentProps } from "react";
import * as RadioPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioPrimitive.Root>) {
  return <RadioPrimitive.Root className={cn("grid gap-2", className)} {...props} />;
}

export function RadioGroupItem({ className, ...props }: ComponentProps<typeof RadioPrimitive.Item>) {
  return <RadioPrimitive.Item className={cn("flex size-4 items-center justify-center rounded-full border border-border-strong bg-card focus:ring-2 focus:ring-primary/20 data-[state=checked]:border-primary", className)} {...props}><RadioPrimitive.Indicator><Circle className="size-2 fill-primary text-primary" /></RadioPrimitive.Indicator></RadioPrimitive.Item>;
}
