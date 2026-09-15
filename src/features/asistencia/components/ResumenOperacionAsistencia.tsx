import type { AsistenciaOperativaDetalleResponseDto } from "../types/asistencia.types";
import { formatFecha } from "../utils/asistenciaFormatters";
import { AsistenciaStatusBadge } from "./AsistenciaStatusBadge";

export interface DatoOperacionAsistencia {
  label: string;
  value: string;
}

interface ResumenOperacionAsistenciaProps {
  asistencia: AsistenciaOperativaDetalleResponseDto;
  datosAdicionales?: DatoOperacionAsistencia[];
}

function DatoSoloLectura({
  label,
  value,
}: DatoOperacionAsistencia) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-foreground-muted">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function ResumenOperacionAsistencia({
  asistencia,
  datosAdicionales = [],
}: ResumenOperacionAsistenciaProps) {
  return (
    <div className="mb-5 grid gap-4 rounded-lg border border-border bg-subtle p-4 sm:grid-cols-2">
      <DatoSoloLectura label="Trabajador" value={asistencia.trabajador} />
      <DatoSoloLectura label="Obra" value={asistencia.obra.nombre} />
      <DatoSoloLectura label="Cuadrilla" value={asistencia.cuadrilla} />
      <DatoSoloLectura label="Fecha" value={formatFecha(asistencia.fecha)} />
      {datosAdicionales.map((dato) => (
        <DatoSoloLectura key={dato.label} {...dato} />
      ))}
      <div className="space-y-1 sm:col-span-2">
        <p className="text-xs font-semibold text-foreground-muted">
          Estado actual
        </p>
        <AsistenciaStatusBadge estado={asistencia.estado} />
      </div>
    </div>
  );
}
