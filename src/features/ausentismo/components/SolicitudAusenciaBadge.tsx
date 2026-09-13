import { Badge } from "@/shared/ui";
import type { EstadoSolicitudAusencia } from "../types/solicitudAusencia.types";
import { ESTADOS_SOLICITUD_AUSENCIA } from "../utils/solicitudAusenciaFormatters";

const variantes = {
  EN_REVISION: "warning", ACEPTADA: "success", RECHAZADA: "error", REVOCADA: "neutral",
} as const;
export function SolicitudAusenciaBadge({ estado }: { estado: EstadoSolicitudAusencia }) {
  return <Badge variant={variantes[estado]}>
    <span className="size-1.5 rounded-full bg-current" />
    {ESTADOS_SOLICITUD_AUSENCIA[estado]}
  </Badge>;
}
