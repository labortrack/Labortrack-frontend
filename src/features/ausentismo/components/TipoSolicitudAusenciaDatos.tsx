import { Badge } from "@/shared/ui";
import type { EstadoTipoSolicitudAusencia, TipoSolicitudAusenciaReglas } from "../types/tipoSolicitudAusencia.types";

export function TipoSolicitudAusenciaBadge({ estado }: { estado: EstadoTipoSolicitudAusencia }) {
  return <Badge variant={estado === "ACTIVO" ? "success" : "neutral"}>
    <span className="size-1.5 rounded-full bg-current" />
    {estado === "ACTIVO" ? "Activo" : "Inactivo"}
  </Badge>;
}

export function TipoSolicitudAusenciaDatos({ datos }: { datos: TipoSolicitudAusenciaReglas }) {
  return <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {[
      ["Nombre", datos.nombre],
      ["Máximo de días", String(datos.maxDias)],
      ["Permite retroactividad", datos.permiteRetroactiva ? "Sí" : "No"],
      ["Requiere documentación", datos.requiereDocumento ? "Sí" : "No"],
    ].map(([label, valor]) => <div key={label}>
      <dt className="text-xs text-foreground-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold">{valor}</dd>
    </div>)}
    <div className="sm:col-span-2 lg:col-span-3">
      <dt className="text-xs text-foreground-muted">Descripción</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm">{datos.descripcion}</dd>
    </div>
  </dl>;
}
