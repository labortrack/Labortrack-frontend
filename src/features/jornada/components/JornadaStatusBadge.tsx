import { Badge } from "@/shared/ui";
import type { EstadoJornadaTrabajo } from "../types/planTrabajo.types";
import { estadoJornadaLabels } from "../utils/planTrabajoFormatters";

export function JornadaStatusBadge({ estado }: { estado: EstadoJornadaTrabajo }) {
  const variant = estado === "ANULADA" ? "error" : estado === "NO_TRABAJADA" ? "warning" : estado === "EN_CURSO" ? "primary" : estado === "FINALIZADA" ? "success" : "neutral";
  return <Badge variant={variant}>{estadoJornadaLabels[estado]}</Badge>;
}
