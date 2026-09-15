import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/cn";
import type { EstadoAsistencia } from "../types/asistencia.types";
import { ESTADO_ASISTENCIA_LABELS } from "../utils/asistenciaFormatters";

type BadgeVariant = "primary" | "neutral" | "success" | "warning" | "error";

const ESTADO_ASISTENCIA_VARIANTS = {
  PENDIENTE_INGRESO: "warning",
  PRESENTE: "success",
  EGRESADO: "primary",
  AUSENTE: "error",
  AUSENCIA_JUSTIFICADA: "error",
  NO_TRABAJADA_COMPUTABLE: "neutral",
  ANULADA: "neutral",
} satisfies Record<EstadoAsistencia, BadgeVariant>;

interface AsistenciaStatusBadgeProps {
  estado: EstadoAsistencia;
  className?: string;
}

export function AsistenciaStatusBadge({
  estado,
  className,
}: AsistenciaStatusBadgeProps) {
  return (
    <Badge
      variant={ESTADO_ASISTENCIA_VARIANTS[estado]}
      className={cn("normal-case tracking-normal", className)}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {ESTADO_ASISTENCIA_LABELS[estado]}
    </Badge>
  );
}
