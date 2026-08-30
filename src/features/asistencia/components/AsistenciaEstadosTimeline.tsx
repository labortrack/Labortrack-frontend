import { CheckCircle2 } from "lucide-react";
import type { EstadoAsistenciaHistorialResponseDto } from "../types/asistencia.types";
import { formatFechaHora } from "../utils/asistenciaFormatters";
import { AsistenciaStatusBadge } from "./AsistenciaStatusBadge";

interface AsistenciaEstadosTimelineProps {
  historial: EstadoAsistenciaHistorialResponseDto[];
}

export function AsistenciaEstadosTimeline({
  historial,
}: AsistenciaEstadosTimelineProps) {
  return (
    <div className="relative space-y-5 pl-7">
      <div className="absolute bottom-3 left-2.5 top-3 w-px bg-border" />
      {historial.map((item, index) => {
        const vigente = item.fechaHoraHasta === null;

        return (
          <div
            key={`${item.estado}-${item.fechaHoraDesde}-${index}`}
            className="relative"
          >
            <span
              className={
                vigente
                  ? "absolute -left-7 top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-white ring-4 ring-primary-soft"
                  : "absolute -left-7 top-0.5 flex size-5 items-center justify-center rounded-full border border-border bg-muted ring-4 ring-page"
              }
            >
              {vigente ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <span className="size-1.5 rounded-full bg-foreground-muted" />
              )}
            </span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <AsistenciaStatusBadge estado={item.estado} />
              <span className="text-xs text-foreground-muted">
                {formatFechaHora(item.fechaHoraDesde)}
                {item.fechaHoraHasta
                  ? ` — ${formatFechaHora(item.fechaHoraHasta)}`
                  : " — Actualidad"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
