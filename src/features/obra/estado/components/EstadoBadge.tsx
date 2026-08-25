import { getEstadoStyle } from "../utils/estadoStyles";
import type { EstadoObraNombre } from "../types/estadoObra.types";
import { cn } from "@/shared/utils/cn";

interface EstadoBadgeProps {
  estado: EstadoObraNombre;
  className?: string;
}

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  const style = getEstadoStyle(estado);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      <span>{estado}</span>
    </span>
  );
}
