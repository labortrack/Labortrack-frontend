import { Link } from "react-router-dom";
import { formatFecha } from "@/features/asistencia/utils/asistenciaFormatters";
import { SolicitudAusenciaBadge } from "@/features/ausentismo/components/SolicitudAusenciaBadge";
import type { SolicitudAusenciaResumen } from "@/features/ausentismo/types/solicitudAusencia.types";

interface SolicitudesRecientesListProps {
  data: SolicitudAusenciaResumen[];
}

export function SolicitudesRecientesList({ data }: SolicitudesRecientesListProps) {
  if (data.length === 0) {
    return <p className="text-sm text-foreground-muted">Todavía no hiciste solicitudes de ausencia.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {data.map((solicitud) => (
        <li key={solicitud.id}>
          <Link
            to={`/mis-ausencias/${solicitud.id}`}
            className="-mx-2 flex items-center justify-between gap-3 rounded-control px-2 py-2.5 hover:bg-subtle"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{solicitud.tipoSolicitud}</p>
              <p className="text-xs tabular-nums text-foreground-muted">
                {solicitud.fechaDesde === solicitud.fechaHasta
                  ? formatFecha(solicitud.fechaDesde)
                  : `${formatFecha(solicitud.fechaDesde)} al ${formatFecha(solicitud.fechaHasta)}`}
              </p>
            </div>
            <span className="shrink-0">
              <SolicitudAusenciaBadge estado={solicitud.estado} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
