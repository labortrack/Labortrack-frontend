import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, ChevronRight, RotateCcw, CalendarDays, Clock, Hash } from "lucide-react";
import { PageHeader, LoadingState, ErrorState, EmptyState, Pagination } from "@/shared/components";
import { Button, Card, CardContent, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Table, TableHeader, TableHead, TableRow, TableBody, TableCell, Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { formatFecha, formatFechaHora } from "@/features/asistencia/utils/asistenciaFormatters";
import { useMisSolicitudesAusencia, useTiposFiltroAusenciaPropios } from "../hooks/useSolicitudesAusencia";
import { ESTADOS_SOLICITUD_AUSENCIA, esFechaValida } from "../utils/solicitudAusenciaFormatters";
import type { EstadoSolicitudAusencia } from "../types/solicitudAusencia.types";
import { SolicitudAusenciaBadge } from "../components/SolicitudAusenciaBadge";
import { SolicitarAusenciaDialog } from "../components/SolicitarAusenciaDialog";

export default function MisSolicitudesAusenciaPage() {
  const [params, setParams] = useSearchParams();
  const [crear, setCrear] = useState(false);
  const pageParam = Number(params.get("page"));
  const page = Number.isSafeInteger(pageParam) && pageParam >= 0 ? pageParam : 0;
  const estadoParam = params.get("estado") ?? "";
  const estado = Object.hasOwn(ESTADOS_SOLICITUD_AUSENCIA, estadoParam) ? estadoParam as EstadoSolicitudAusencia : undefined;
  const tipoId = Number(params.get("tipoSolicitudAusenciaId"));
  const fechaDesde = params.get("fechaDesde") ?? "";
  const fechaHasta = params.get("fechaHasta") ?? "";
  const errorFechas = (fechaDesde && !esFechaValida(fechaDesde)) || (fechaHasta && !esFechaValida(fechaHasta))
    ? "Ingresá fechas válidas." : fechaDesde && fechaHasta && fechaHasta < fechaDesde ? "La fecha hasta no puede ser anterior a la fecha desde." : "";
  const filtros = { page, estado, tipoSolicitudAusenciaId: Number.isSafeInteger(tipoId) && tipoId > 0 ? tipoId : undefined, fechaDesde: fechaDesde || undefined, fechaHasta: fechaHasta || undefined };
  const query = useMisSolicitudesAusencia(filtros, !errorFechas);
  const tipos = useTiposFiltroAusenciaPropios();
  const datos = query.data;
  const hayFiltros = Boolean(estado || filtros.tipoSolicitudAusenciaId || fechaDesde || fechaHasta);
  const cambiar = (key: string, value: string) => setParams((actual) => {
    const next = new URLSearchParams(actual);
    if (value && value !== "todos") next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    return next;
  }, { replace: true });
  useEffect(() => {
    if (datos && !errorFechas && !query.isFetching && !query.isPlaceholderData && page > 0 && page >= datos.totalPages) {
      setParams((actual) => {
        const next = new URLSearchParams(actual);
        next.set("page", String(Math.max(0, datos.totalPages - 1)));
        return next;
      }, { replace: true });
    }
  }, [datos, errorFechas, page, query.isFetching, query.isPlaceholderData, setParams]);
  return <div className="space-y-6">
    <PageHeader title="Mis solicitudes de ausencia" description="Consultá tus solicitudes y seguí su evaluación por Recursos Humanos."
      actions={<Button onClick={() => setCrear(true)} className="w-full sm:w-auto"><Plus />Solicitar ausencia</Button>} />
    <Card><CardContent className="space-y-3 p-4 sm:p-5">
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <div><Label htmlFor="filtro-estado" className="mb-1.5 block">Estado</Label>
          <Select value={estado ?? "todos"} onValueChange={(value) => cambiar("estado", value)}><SelectTrigger id="filtro-estado"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="todos">Todos</SelectItem>{Object.entries(ESTADOS_SOLICITUD_AUSENCIA).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><Label htmlFor="filtro-tipo" className="mb-1.5 block">Tipo de solicitud</Label>
          <Select value={filtros.tipoSolicitudAusenciaId ? String(tipoId) : "todos"} onValueChange={(value) => cambiar("tipoSolicitudAusenciaId", value)} disabled={tipos.isPending || tipos.isError}>
            <SelectTrigger id="filtro-tipo"><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem>{tipos.data?.map((tipo) => <SelectItem key={tipo.id} value={String(tipo.id)}>{tipo.nombre}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><Label htmlFor="filtro-desde" className="mb-1.5 block">Fecha desde</Label><Input id="filtro-desde" type="date" value={fechaDesde} onChange={(e) => cambiar("fechaDesde", e.target.value)} aria-invalid={!!errorFechas} aria-describedby={errorFechas ? "filtro-fechas-error" : undefined} /></div>
        <div><Label htmlFor="filtro-hasta" className="mb-1.5 block">Fecha hasta</Label><Input id="filtro-hasta" type="date" value={fechaHasta} onChange={(e) => cambiar("fechaHasta", e.target.value)} aria-invalid={!!errorFechas} aria-describedby={errorFechas ? "filtro-fechas-error" : undefined} /></div>
        <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" aria-label="Limpiar filtros" onClick={() => setParams({}, { replace: true })}><RotateCcw /></Button></TooltipTrigger><TooltipContent>Limpiar filtros</TooltipContent></Tooltip>
      </div>
      <p className="text-xs text-foreground-muted">El rango incluye las solicitudes que coinciden con al menos una fecha del período.</p>
      {errorFechas && <p id="filtro-fechas-error" role="alert" className="text-sm text-error">{errorFechas}</p>}
      {tipos.isError && <ErrorState message="No se pudieron cargar los tipos del historial." onRetry={() => void tipos.refetch()} />}
    </CardContent></Card>
    <Card className="overflow-hidden" aria-busy={query.isFetching}>
      {errorFechas ? <EmptyState title="Corregí el rango de fechas para consultar tus solicitudes." /> : query.isPending ? <LoadingState label="Cargando solicitudes…" />
        : query.isError ? <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} />
        : !datos?.content.length ? <EmptyState title={hayFiltros ? "No se encontraron solicitudes con los filtros seleccionados." : "No tenés solicitudes de ausencia registradas."}
          action={hayFiltros ? <Button variant="outline" onClick={() => setParams({}, { replace: true })}>Limpiar filtros</Button> : <Button variant="outline" onClick={() => setCrear(true)}>Solicitar ausencia</Button>} />
        : <><div className="border-b border-border bg-muted px-5 py-3 text-xs text-foreground-muted" role="status">{datos.totalElements} solicitudes{query.isFetching ? " · Actualizando resultados…" : ""}</div>
          <div className="hidden overflow-x-auto md:block"><Table><TableHeader><TableRow>{["Tipo", "Fecha desde", "Fecha hasta", "Días", "Estado", "Fecha de creación", "Acción"].map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{datos.content.map((solicitud) => <TableRow key={solicitud.id}>
              <TableCell className="max-w-64 whitespace-normal break-words font-semibold">{solicitud.tipoSolicitud}</TableCell>
              <TableCell>{formatFecha(solicitud.fechaDesde)}</TableCell><TableCell>{formatFecha(solicitud.fechaHasta)}</TableCell><TableCell>{solicitud.cantidadDias}</TableCell>
              <TableCell><SolicitudAusenciaBadge estado={solicitud.estado} /></TableCell><TableCell>{formatFechaHora(solicitud.fechaHoraSolicitud)}</TableCell>
              <TableCell><Button variant="ghost" size="sm" asChild><Link to={`/mis-ausencias/${solicitud.id}${params.size ? `?${params}` : ""}`}>Ver detalle<ChevronRight /></Link></Button></TableCell>
            </TableRow>)}</TableBody></Table></div>

          <div className="space-y-3 bg-muted/20 p-4 md:hidden">
            {datos.content.map((solicitud) => (
              <Card key={solicitud.id}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="min-w-0 flex-1 break-words text-sm font-semibold">{solicitud.tipoSolicitud}</h2>
                    <SolicitudAusenciaBadge estado={solicitud.estado} />
                  </div>
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 size-4 shrink-0 text-foreground-muted" aria-hidden="true" />
                      <div><dt className="text-xs text-foreground-muted">Período solicitado</dt>
                        <dd>{formatFecha(solicitud.fechaDesde)} – {formatFecha(solicitud.fechaHasta)}</dd></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Hash className="mt-0.5 size-4 shrink-0 text-foreground-muted" aria-hidden="true" />
                      <div><dt className="text-xs text-foreground-muted">Días solicitados</dt><dd>{solicitud.cantidadDias}</dd></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 size-4 shrink-0 text-foreground-muted" aria-hidden="true" />
                      <div><dt className="text-xs text-foreground-muted">Fecha de creación</dt><dd>{formatFechaHora(solicitud.fechaHoraSolicitud)}</dd></div>
                    </div>
                  </dl>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/mis-ausencias/${solicitud.id}${params.size ? `?${params}` : ""}`}>Ver detalle<ChevronRight /></Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={datos.totalPages} totalElements={datos.totalElements} disabled={query.isFetching} onPageChange={(value) => cambiar("page", String(value))} /></>}
    </Card>
    {crear && <SolicitarAusenciaDialog onClose={() => setCrear(false)} />}
  </div>;
}

