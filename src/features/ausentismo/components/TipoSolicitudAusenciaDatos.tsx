import { CalendarDays, History, Paperclip, Tags, AlignLeft, type LucideIcon } from "lucide-react";
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
    {([
      ["Nombre", datos.nombre, Tags],
      ["Máximo de días", String(datos.maxDias), CalendarDays],
      ["Permite retroactividad", datos.permiteRetroactiva ? "Sí" : "No", History],
      ["Requiere documentación", datos.requiereDocumento ? "Sí" : "No", Paperclip],
    ] as [string, string, LucideIcon][]).map(([label, valor, Icon]) => <div key={label}>
      <dt className="flex items-center gap-2 text-xs text-foreground-muted"><Icon className="size-4 text-primary" aria-hidden="true" />{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold">{valor}</dd>
    </div>)}
    <div className="sm:col-span-2 lg:col-span-3">
      <dt className="flex items-center gap-2 text-xs text-foreground-muted"><AlignLeft className="size-4 text-primary" aria-hidden="true" />Descripción</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words text-sm">{datos.descripcion}</dd>
    </div>
  </dl>;
}
