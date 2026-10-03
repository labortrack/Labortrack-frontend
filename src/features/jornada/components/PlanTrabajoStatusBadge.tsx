import { Badge } from "@/shared/ui";
import type { EstadoCalculadoPlanTrabajo } from "../types/planTrabajo.types";
import { estadoPlanLabels } from "../utils/planTrabajoFormatters";

export function PlanTrabajoStatusBadge({
  estado,
  cancelado = false,
}: {
  estado: EstadoCalculadoPlanTrabajo;
  cancelado?: boolean;
}) {
  if (cancelado) return <Badge variant="error">Cancelado</Badge>;
  const variant =
    estado === "VIGENTE"
      ? "success"
      : estado === "PROGRAMADO"
        ? "primary"
        : "neutral";
  return <Badge variant={variant}>{estadoPlanLabels[estado]}</Badge>;
}
