import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock, Paperclip, UserRound } from "lucide-react";
import { Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui";
import { formatFecha, formatFechaHora } from "@/features/asistencia/utils/asistenciaFormatters";
import { SolicitudAusenciaBadge } from "./SolicitudAusenciaBadge";
import type { SolicitudAusenciaAdministrativaResumen } from "../types/solicitudAusenciaAdministrativa.types";

export function SolicitudesAusenciaAdministrativasList({ solicitudes, search }: { solicitudes: SolicitudAusenciaAdministrativaResumen[]; search: string }) {
  const detalleUrl = (id: number) => `/ausencias/solicitudes/${id}${search ? `?${search}` : ""}`;
  return <>
    <div className="hidden overflow-x-auto lg:block">
      <Table>
        <TableHeader><TableRow>{["Empleado", "Tipo", "Fecha desde", "Fecha hasta", "Días", "Estado", "Fecha de solicitud", "Documentación", "Acción"].map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{solicitudes.map((solicitud) => (
          <TableRow key={solicitud.id}>
            <TableCell className="max-w-56 whitespace-normal break-words font-semibold">{solicitud.empleado.nombre} {solicitud.empleado.apellido}</TableCell>
            <TableCell className="max-w-56 whitespace-normal break-words">{solicitud.tipoSolicitud}</TableCell>
            <TableCell>{formatFecha(solicitud.fechaDesde)}</TableCell>
            <TableCell>{formatFecha(solicitud.fechaHasta)}</TableCell>
            <TableCell>{solicitud.cantidadDias}</TableCell>
            <TableCell><SolicitudAusenciaBadge estado={solicitud.estado} /></TableCell>
            <TableCell>{formatFechaHora(solicitud.fechaHoraSolicitud)}</TableCell>
            <TableCell><span className="flex items-center gap-1.5">{solicitud.tieneDocumentacionAdjunta && <Paperclip className="size-4 text-primary" aria-hidden="true" />}{solicitud.tieneDocumentacionAdjunta ? "Adjunta" : "Sin adjuntos"}</span></TableCell>
            <TableCell><Button variant="ghost" size="sm" asChild><Link to={detalleUrl(solicitud.id)} aria-label={`Ver detalle de la solicitud de ${solicitud.empleado.nombre} ${solicitud.empleado.apellido} del ${formatFecha(solicitud.fechaDesde)}`}>Ver detalle<ChevronRight /></Link></Button></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
    <div className="space-y-3 bg-muted/20 p-4 lg:hidden">
      {solicitudes.map((solicitud) => (
        <Card key={solicitud.id}><CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="min-w-0 flex-1 break-words text-sm font-semibold">{solicitud.empleado.nombre} {solicitud.empleado.apellido}</h2>
            <SolicitudAusenciaBadge estado={solicitud.estado} />
          </div>
          <dl className="space-y-3 text-sm">
            <Dato icon={UserRound} label="Tipo de solicitud" value={solicitud.tipoSolicitud} />
            <Dato icon={CalendarDays} label="Período solicitado" value={`${formatFecha(solicitud.fechaDesde)} – ${formatFecha(solicitud.fechaHasta)} · ${solicitud.cantidadDias} días`} />
            <Dato icon={Clock} label="Fecha de solicitud" value={formatFechaHora(solicitud.fechaHoraSolicitud)} />
            <Dato icon={Paperclip} label="Documentación" value={solicitud.tieneDocumentacionAdjunta ? "Documentación adjunta" : "Sin adjuntos"} />
          </dl>
          <Button variant="outline" size="sm" className="w-full" asChild><Link to={detalleUrl(solicitud.id)}>Ver detalle<ChevronRight /></Link></Button>
        </CardContent></Card>
      ))}
    </div>
  </>;
}
function Dato({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="flex items-start gap-2"><Icon className="mt-0.5 size-4 shrink-0 text-foreground-muted" aria-hidden="true" />
    <div className="min-w-0"><dt className="text-xs text-foreground-muted">{label}</dt><dd className="break-words">{value}</dd></div>
  </div>;
}

