import { Bot } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface TrackyAvatarProps {
  className?: string;
  iconClassName?: string;
}

/** Avatar de Tracky: ícono de bot sobre el color de acción primario. Decorativo. */
export function TrackyAvatar({ className, iconClassName }: TrackyAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 items-center justify-center rounded-lg bg-primary text-white shadow-soft",
        className,
      )}
    >
      <Bot className={cn("size-5", iconClassName)} />
    </span>
  );
}
