import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RotateCcw, Settings2 } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeader, Pagination, SearchInput } from "@/shared/components";
import { Button, Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useOpcionesAusenciaAdministrativas, useSolicitudesAusenciaAdministrativas } from "../hooks/useSolicitudesAusenciaAdministrativas";
import { SolicitudesAusenciaAdministrativasList } from "../components/SolicitudesAusenciaAdministrativasList";
import { ESTADOS_SOLICITUD_AUSENCIA, esFechaValida } from "../utils/solicitudAusenciaFormatters";
import type { EstadoSolicitudAusencia } from "../types/solicitudAusencia.types";

const idFiltro = (valor: string | null) => {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};
export default function SolicitudesAusenciaPage() {
  const [params, setParams] = useSearchParams();
  const empleado = params.get("empleado") ?? "";
  const [empleadoConsulta, setEmpleadoConsulta] = useState(empleado);
  useEffect(() => {
    const timer = setTimeout(() => setEmpleadoConsulta(empleado), 300);
    return () => clearTimeout(timer);
  }, [empleado]);
  const estadoParam = params.get("estado") ?? "";
  const estado = Object.hasOwn(ESTADOS_SOLICITUD_AUSENCIA, estadoParam) ? estadoParam as EstadoSolicitudAusencia : undefined;
  const pagina = Number(params.get("page"));
  const page = Number.isSafeInteger(pagina) && pagina >= 0 ? pagina : 0;
  const obraId = idFiltro(params.get("obraId"));
  const cuadrillaId = idFiltro(params.get("cuadrillaId"));
  const tipoSolicitudAusenciaId = idFiltro(params.get("tipoSolicitudAusenciaId"));
  const fechaDesde = params.get("fechaDesde") ?? "";
  const fechaHasta = params.get("fechaHasta") ?? "";
  const errorFechas = (fechaDesde && !esFechaValida(fechaDesde)) || (fechaHasta && !esFechaValida(fechaHasta))
    ? "Ingresá fechas válidas." : fechaDesde && fechaHasta && fechaHasta < fechaDesde ? "La fecha hasta no puede ser anterior a la fecha desde." : "";
  const filtros = { page, estado, obraId, cuadrillaId, tipoSolicitudAusenciaId,
    empleado: empleadoConsulta.trim() || undefined, fechaDesde: fechaDesde || undefined, fechaHasta: fechaHasta || undefined };
  const query = useSolicitudesAusenciaAdministrativas(filtros, !errorFechas);
  const { tipos, ubicaciones } = useOpcionesAusenciaAdministrativas(obraId);
  const datos = query.data;
  const buscando = query.isFetching || empleado !== empleadoConsulta;
  const hayFiltros = Boolean(empleado.trim() || estado || obraId || cuadrillaId || tipoSolicitudAusenciaId || fechaDesde || fechaHasta);
  const cambiar = (key: string, value: string) => setParams((actual) => {
    const next = new URLSearchParams(actual);
    if (value && value !== "todos") next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    if (key === "obraId") next.delete("cuadrillaId");
    return next;
  }, { replace: true });
  const limpiar = () => setParams({}, { replace: true });
  useEffect(() => {
    if (datos && !errorFechas && !buscando && !query.isPlaceholderData && page > 0 && page >= datos.totalPages) {
      setParams((actual) => { const next = new URLSearchParams(actual); next.set("page", String(Math.max(0, datos.totalPages - 1))); return next; }, { replace: true });
    }
  }, [datos, errorFechas, buscando, page, query.isPlaceholderData, setParams]);

  return <div className="space-y-6">
    <PageHeader title="Solicitudes de ausencia" description="Consultá las solicitudes de los empleados y revisá su evaluación."
      actions={<Button variant="outline" asChild className="w-full sm:w-auto"><Link to="/ausencias/tipos-solicitud"><Settings2 />Configurar tipos de solicitud</Link></Button>} />
    <Card><CardContent className="space-y-3 p-4 sm:p-5">
      <div className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div><Label htmlFor="ausencias-empleado" className="mb-1.5 block">Empleado</Label><SearchInput id="ausencias-empleado" placeholder="Buscar por nombre o apellido" value={empleado} onChange={(event) => cambiar("empleado", event.target.value)} /></div>
        <Filtro id="ausencias-estado" label="Estado" value={estado ?? "todos"} onChange={(value) => cambiar("estado", value)} opciones={Object.entries(ESTADOS_SOLICITUD_AUSENCIA)} />
        <Filtro id="ausencias-tipo" label="Tipo de solicitud" value={tipoSolicitudAusenciaId ? String(tipoSolicitudAusenciaId) : "todos"} onChange={(value) => cambiar("tipoSolicitudAusenciaId", value)}
          disabled={tipos.isPending || tipos.isError} opciones={tipos.data?.map((tipo) => [String(tipo.id), tipo.nombre]) ?? []} />
        <div><Label htmlFor="ausencias-desde" className="mb-1.5 block">Fecha desde</Label><Input id="ausencias-desde" type="date" value={fechaDesde} onChange={(event) => cambiar("fechaDesde", event.target.value)} aria-invalid={!!errorFechas} aria-describedby={errorFechas ? "ausencias-fechas-error" : undefined} /></div>
        <div><Label htmlFor="ausencias-hasta" className="mb-1.5 block">Fecha hasta</Label><Input id="ausencias-hasta" type="date" value={fechaHasta} onChange={(event) => cambiar("fechaHasta", event.target.value)} aria-invalid={!!errorFechas} aria-describedby={errorFechas ? "ausencias-fechas-error" : undefined} /></div>
        <Filtro id="ausencias-obra" label="Obra" value={obraId ? String(obraId) : "todos"} onChange={(value) => cambiar("obraId", value)}
          disabled={ubicaciones.isPending || ubicaciones.isError} opciones={ubicaciones.data?.obras.map((obra) => [String(obra.id), obra.nombre]) ?? []} />
        <Filtro id="ausencias-cuadrilla" label="Cuadrilla" value={cuadrillaId ? String(cuadrillaId) : "todos"} onChange={(value) => cambiar("cuadrillaId", value)}
          disabled={ubicaciones.isPending || ubicaciones.isError} opciones={ubicaciones.data?.cuadrillas.map((cuadrilla) => [String(cuadrilla.id), cuadrilla.nombre]) ?? []} />
        <Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" aria-label="Limpiar filtros" onClick={limpiar}><RotateCcw /></Button></TooltipTrigger><TooltipContent>Limpiar filtros</TooltipContent></Tooltip>
      </div>
      <p className="text-xs text-foreground-muted">El rango incluye solicitudes que coinciden con al menos una fecha del período. Obra y cuadrilla se filtran por las jornadas asociadas; solo se ofrecen obras y cuadrillas presentes en solicitudes. Al elegir una obra, sus cuadrillas se filtran.</p>
      {errorFechas && <p id="ausencias-fechas-error" role="alert" className="text-sm text-error">{errorFechas}</p>}
      {[{ consulta: tipos, nombre: "tipos de solicitud" }, { consulta: ubicaciones, nombre: "obras y cuadrillas" }].map(({ consulta, nombre }) => {
        return consulta.isError ? <div key={String(nombre)} className="flex flex-wrap items-center gap-2 text-sm text-error" role="alert">No se pudieron cargar {String(nombre)}.<Button variant="ghost" size="sm" onClick={() => void consulta.refetch()}>Reintentar</Button></div> : null;
      })}
    </CardContent></Card>
    <Card className="overflow-hidden" aria-busy={buscando}>
      {errorFechas ? <EmptyState title="Corregí el rango de fechas para consultar las solicitudes." />
        : query.isPending ? <LoadingState label="Cargando solicitudes…" />
        : query.isError ? <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} />
        : !datos?.content.length ? <EmptyState title={hayFiltros ? "No se encontraron solicitudes con los filtros seleccionados." : "No hay solicitudes de ausencia registradas."}
          action={hayFiltros ? <Button variant="outline" onClick={limpiar}><RotateCcw />Limpiar filtros</Button> : undefined} />
        : <><div className="border-b border-border bg-muted px-5 py-3 text-xs text-foreground-muted" role="status">{datos.totalElements} solicitudes{buscando ? " · Actualizando resultados…" : ""}</div>
          <SolicitudesAusenciaAdministrativasList solicitudes={datos.content} search={params.toString()} />
          <Pagination page={page} totalPages={datos.totalPages} totalElements={datos.totalElements} disabled={buscando} onPageChange={(value) => cambiar("page", String(value))} />
        </>}
    </Card>
  </div>;
}
function Filtro({ id, label, value, onChange, opciones, disabled }: {
  id: string; label: string; value: string; onChange: (value: string) => void; opciones: [string, string][]; disabled?: boolean;
}) {
  return <div><Label htmlFor={id} className="mb-1.5 block">{label}</Label>
    <Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger id={id}><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="todos">Todos</SelectItem>{opciones.map(([valor, texto]) => <SelectItem key={valor} value={valor}>{texto}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}

