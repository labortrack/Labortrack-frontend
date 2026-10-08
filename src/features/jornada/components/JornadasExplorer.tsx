import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, FilterX, List, Rows3 } from "lucide-react";
import { Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Spinner, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui";
import { EmptyState, ErrorState, LoadingState, Pagination } from "@/shared/components";
import { cuadrillaApi } from "@/features/cuadrilla/api/cuadrillaApi";
import type { CuadrillaResponseDto } from "@/features/cuadrilla/types/cuadrilla.types";
import { useObras } from "@/features/obra/hooks/useObras";
import { useJornadas, useJornadasSemana } from "../hooks/useJornadas";
import type { JornadaFiltros, JornadaResumen } from "../types/jornada.types";
import type { EstadoJornadaTrabajo, TipoJornada } from "../types/planTrabajo.types";
import { decisionLabels, formatDate, formatTime, estadoJornadaLabels, tipoJornadaLabels } from "../utils/planTrabajoFormatters";
import { fechaLocal, inicioSemana, rutaDetalleJornada, sumarDias } from "../utils/jornadaNavigation";
import { JornadaStatusBadge } from "./JornadaStatusBadge";

const ALL = "TODOS";
const tipos = Object.keys(tipoJornadaLabels) as TipoJornada[];
const estados = Object.keys(estadoJornadaLabels) as EstadoJornadaTrabajo[];

function idParam(value: string | null) {
  const id = Number(value);
  return value && Number.isInteger(id) && id > 0 ? id : undefined;
}

function JornadaCard({ jornada, onDetail }: { jornada: JornadaResumen; onDetail: () => void }) {
  return (
    <article className="space-y-2 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="min-w-0 text-xs font-semibold text-foreground">{jornada.obraNombre}</div>
      <p className="truncate text-xs text-foreground-muted">{jornada.cuadrillaNombre}</p>
      <p className="text-xs">{formatTime(jornada.horaInicioPlanificada)} a {formatTime(jornada.horaFinPlanificada)} · {tipoJornadaLabels[jornada.tipo]}</p>
      <div className="flex flex-wrap items-center gap-1.5"><JornadaStatusBadge estado={jornada.estado} />{jornada.extraordinaria ? <span className="text-xs text-foreground-muted">Extraordinaria</span> : null}</div>
      <button type="button" onClick={onDetail} className="text-xs font-semibold text-primary hover:underline">Ver detalle</button>
    </article>
  );
}

export function JornadasExplorer({ cuadrillaId, embedded = false, active = true, rrhh = false }: { cuadrillaId?: number; embedded?: boolean; active?: boolean; rrhh?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const vista = searchParams.get("jornadaVista") === "listado" ? "listado" : "agenda";
  const semana = inicioSemana(searchParams.get("jornadaSemana") || fechaLocal());
  const semanaHasta = sumarDias(semana, 6);
  const fechaDesde = searchParams.get("jornadaDesde") || "";
  const fechaHasta = searchParams.get("jornadaHasta") || "";
  const obraId = cuadrillaId || !rrhh ? undefined : idParam(searchParams.get("jornadaObra"));
  const cuadrillaFiltro = cuadrillaId ? undefined : idParam(searchParams.get("jornadaCuadrilla"));
  const tipoParam = searchParams.get("jornadaTipo");
  const tipo = tipos.includes(tipoParam as TipoJornada) ? tipoParam as TipoJornada : undefined;
  const estadoParam = searchParams.get("jornadaEstado");
  const estado = estados.includes(estadoParam as EstadoJornadaTrabajo) && (rrhh || estadoParam !== "ANULADA") ? estadoParam as EstadoJornadaTrabajo : undefined;
  const condicionParam = searchParams.get("jornadaCondicion");
  const condicion = condicionParam === "extraordinaria" || condicionParam === "ordinaria" ? condicionParam : undefined;
  const extraordinaria = condicion === "extraordinaria" ? true : condicion === "ordinaria" ? false : undefined;
  const pageParam = Number(searchParams.get("jornadaPagina") ?? 0);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 0;
  const rangoInvalido = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta);
  const rangoSemanaDesde = fechaDesde && fechaDesde > semana ? fechaDesde : semana;
  const rangoSemanaHasta = fechaHasta && fechaHasta < semanaHasta ? fechaHasta : semanaHasta;
  const sinInterseccion = rangoSemanaDesde > rangoSemanaHasta;
  const filtrosBase: JornadaFiltros = useMemo(() => ({
    obraId, cuadrillaId: cuadrillaFiltro, tipo, estado, extraordinaria,
  }), [obraId, cuadrillaFiltro, tipo, estado, extraordinaria]);
  const filtrosSemana: JornadaFiltros = useMemo(() => ({ ...filtrosBase, fechaDesde: rangoSemanaDesde, fechaHasta: rangoSemanaHasta }), [filtrosBase, rangoSemanaDesde, rangoSemanaHasta]);
  const filtrosListado: JornadaFiltros = useMemo(() => ({ ...filtrosBase, fechaDesde: fechaDesde || semana, fechaHasta: fechaHasta || semanaHasta, page, size: 20 }), [filtrosBase, fechaDesde, fechaHasta, semana, semanaHasta, page]);
  const weekQuery = useJornadasSemana(filtrosSemana, cuadrillaId, active && vista === "agenda" && !rangoInvalido && !sinInterseccion);
  const listQuery = useJornadas(filtrosListado, cuadrillaId, active && vista === "listado" && !rangoInvalido);
  const obrasQuery = useObras(undefined, active && !cuadrillaId);
  const opcionesObraId = obraId ?? (!rrhh ? obrasQuery.data?.[0]?.id : undefined);
  const cuadrillasQuery = useQuery({
    queryKey: ["jornadas", "opciones-cuadrilla", opcionesObraId],
    queryFn: async () => {
      const result: CuadrillaResponseDto[] = [];
      let nextPage = 0;
      let totalPages: number;
      do {
        const response = await cuadrillaApi.getByObraId(opcionesObraId!, nextPage, 100);
        result.push(...response.content);
        totalPages = response.totalPages;
        nextPage++;
      } while (nextPage < totalPages);
      return result;
    },
    enabled: active && !cuadrillaId && Boolean(opcionesObraId),
  });
  const cuadrillas = cuadrillasQuery.data ?? [];
  const isPending = vista === "agenda" ? weekQuery.isPending : listQuery.isPending;
  const isError = vista === "agenda" ? weekQuery.isError : listQuery.isError;
  const isFetching = vista === "agenda" ? weekQuery.isFetching : listQuery.isFetching;
  const jornadas = vista === "agenda" ? (weekQuery.data ?? []) : (listQuery.data?.jornadas.content ?? []);
  const hayFiltros = Boolean(fechaDesde || fechaHasta || obraId || cuadrillaFiltro || tipo || estado || condicion);

  const update = (key: string, value: string, resetPage = true) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value && value !== ALL) next.set(key, value); else next.delete(key);
      if (key === "jornadaObra") next.delete("jornadaCuadrilla");
      if ((key === "jornadaDesde" || key === "jornadaHasta") && value) {
        next.set("jornadaSemana", inicioSemana(next.get("jornadaDesde") || value));
      }
      if (resetPage) next.delete("jornadaPagina");
      return next;
    });
  };
  const clear = () => setSearchParams((current) => {
    const next = new URLSearchParams(current);
    for (const key of ["jornadaDesde", "jornadaHasta", "jornadaObra", "jornadaCuadrilla", "jornadaTipo", "jornadaEstado", "jornadaCondicion", "jornadaPagina"]) next.delete(key);
    return next;
  });
  const openDetail = (id: number) => navigate(rutaDetalleJornada(id, `${location.pathname}${location.search}`));

  const controls = (
    <div className="space-y-4 border-b border-border bg-muted/20 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => update("jornadaSemana", sumarDias(semana, -7))} aria-label="Semana anterior"><ChevronLeft className="size-4" />Anterior</Button>
          <span className="rounded-lg bg-primary-soft px-3 py-2 text-xs font-semibold text-primary">{formatDate(semana)} al {formatDate(semanaHasta)}</span>
          <Button variant="outline" size="sm" onClick={() => update("jornadaSemana", inicioSemana(fechaLocal()))}>Hoy</Button>
          <Button variant="outline" size="sm" onClick={() => update("jornadaSemana", sumarDias(semana, 7))} aria-label="Semana siguiente">Siguiente<ChevronRight className="size-4" /></Button>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1" role="group" aria-label="Vista de jornadas">
          <Button size="sm" variant={vista === "agenda" ? "primary" : "ghost"} aria-pressed={vista === "agenda"} onClick={() => update("jornadaVista", "agenda")}><Rows3 className="size-4" />Agenda</Button>
          <Button size="sm" variant={vista === "listado" ? "primary" : "ghost"} aria-pressed={vista === "listado"} onClick={() => update("jornadaVista", "listado")}><List className="size-4" />Listado</Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {!cuadrillaId && rrhh ? (
          <label className="space-y-1 text-xs font-semibold text-foreground-muted">Obra
            <Select value={obraId ? String(obraId) : ALL} onValueChange={(value) => update("jornadaObra", value)} disabled={obrasQuery.isPending}>
              <SelectTrigger className="h-9 bg-card text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value={ALL}>Todas las obras</SelectItem>{(obrasQuery.data ?? []).map((obra) => <SelectItem key={obra.id} value={String(obra.id)}>{obra.nombreObra}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        ) : null}
        {!cuadrillaId ? (
          <label className="space-y-1 text-xs font-semibold text-foreground-muted">Cuadrilla
            <Select value={cuadrillaFiltro ? String(cuadrillaFiltro) : ALL} onValueChange={(value) => update("jornadaCuadrilla", value)} disabled={!opcionesObraId || cuadrillasQuery.isPending}>
              <SelectTrigger className="h-9 bg-card text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value={ALL}>Todas las cuadrillas</SelectItem>{cuadrillas.map((cuadrilla) => <SelectItem key={cuadrilla.id} value={String(cuadrilla.id)}>{cuadrilla.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </label>
        ) : null}
        <label className="space-y-1 text-xs font-semibold text-foreground-muted">Desde<Input type="date" value={fechaDesde} max={fechaHasta || undefined} onChange={(event) => update("jornadaDesde", event.target.value)} className="h-9 bg-card text-xs" /></label>
        <label className="space-y-1 text-xs font-semibold text-foreground-muted">Hasta<Input type="date" value={fechaHasta} min={fechaDesde || undefined} onChange={(event) => update("jornadaHasta", event.target.value)} className="h-9 bg-card text-xs" /></label>
        <label className="space-y-1 text-xs font-semibold text-foreground-muted">Tipo
          <Select value={tipo ?? ALL} onValueChange={(value) => update("jornadaTipo", value)}><SelectTrigger className="h-9 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Todos</SelectItem>{tipos.map((value) => <SelectItem key={value} value={value}>{tipoJornadaLabels[value]}</SelectItem>)}</SelectContent></Select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-foreground-muted">Estado
          <Select value={estado ?? ALL} onValueChange={(value) => update("jornadaEstado", value)}><SelectTrigger className="h-9 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Todos</SelectItem>{estados.filter((value) => rrhh || value !== "ANULADA").map((value) => <SelectItem key={value} value={value}>{estadoJornadaLabels[value]}</SelectItem>)}</SelectContent></Select>
        </label>
        <label className="space-y-1 text-xs font-semibold text-foreground-muted">Condición
          <Select value={condicion ?? ALL} onValueChange={(value) => update("jornadaCondicion", value)}><SelectTrigger className="h-9 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>Todas</SelectItem><SelectItem value="ordinaria">Ordinaria</SelectItem><SelectItem value="extraordinaria">Extraordinaria</SelectItem></SelectContent></Select>
        </label>
      </div>
      {!cuadrillaId && obrasQuery.isError ? <p className="text-xs text-error">No se pudieron cargar las opciones de obra. Los demás filtros siguen disponibles.</p> : null}
      {!cuadrillaId && opcionesObraId && cuadrillasQuery.isError ? <p className="text-xs text-error">No se pudieron cargar las opciones de cuadrilla. Los demás filtros siguen disponibles.</p> : null}
      <Button variant="outline" size="sm" disabled={!hayFiltros} onClick={clear}><FilterX className="size-4" />Limpiar filtros</Button>
    </div>
  );

  return (
    <Card className={embedded ? "overflow-hidden rounded-none border-0 shadow-none" : "overflow-hidden"} aria-busy={isFetching}>
      {controls}
      {isFetching && !isPending ? <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-foreground-muted" role="status"><Spinner className="size-4" />Actualizando jornadas…</div> : null}
      {rangoInvalido ? <div className="p-5 text-sm text-error">La fecha desde no puede ser posterior a la fecha hasta.</div> : isPending && !sinInterseccion ? <LoadingState label="Cargando jornadas…" /> : isError ? <ErrorState message="No se pudieron cargar las jornadas." onRetry={() => void (vista === "agenda" ? weekQuery.refetch() : listQuery.refetch())} /> : jornadas.length === 0 ? <EmptyState title="No se encontraron jornadas de trabajo" description="Probá con otra semana o ajustá los filtros." action={hayFiltros ? <Button variant="outline" size="sm" onClick={clear}>Limpiar filtros</Button> : undefined} /> : vista === "agenda" ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-7 divide-x divide-border">
            {Array.from({ length: 7 }, (_, index) => {
              const fecha = sumarDias(semana, index);
              const delDia = jornadas.filter((item) => item.fecha === fecha);
              return <div key={fecha} className="min-h-40 min-w-0 bg-muted/10"><div className="border-b border-border bg-card px-3 py-3 text-center text-xs font-semibold">{new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(new Date(`${fecha}T12:00:00`))} {formatDate(fecha)}</div><div className="space-y-2 p-2">{delDia.map((item) => <JornadaCard key={item.id} jornada={item} onDetail={() => openDetail(item.id)} />)}</div></div>;
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Obra</TableHead><TableHead>Cuadrilla</TableHead><TableHead>Horario</TableHead><TableHead>Tipo</TableHead><TableHead>Estado</TableHead><TableHead>Condición</TableHead><TableHead>Decisión</TableHead><TableHead>Detalle</TableHead></TableRow></TableHeader><TableBody>{jornadas.map((item) => <TableRow key={item.id}><TableCell className="font-semibold">{formatDate(item.fecha)}</TableCell><TableCell>{item.obraNombre}</TableCell><TableCell>{item.cuadrillaNombre}</TableCell><TableCell>{formatTime(item.horaInicioPlanificada)} a {formatTime(item.horaFinPlanificada)}</TableCell><TableCell>{tipoJornadaLabels[item.tipo]}</TableCell><TableCell><JornadaStatusBadge estado={item.estado} /></TableCell><TableCell>{item.extraordinaria ? "Extraordinaria" : "Ordinaria"}</TableCell><TableCell>{item.tipo === "NO_LABORABLE" ? decisionLabels[item.decisionDiaNoLaborable] : "No aplica"}</TableCell><TableCell><Button variant="outline" size="sm" onClick={() => openDetail(item.id)}>Ver detalle</Button></TableCell></TableRow>)}</TableBody></Table></div>
          {listQuery.data ? <Pagination page={listQuery.data.jornadas.number} totalPages={listQuery.data.jornadas.totalPages} totalElements={listQuery.data.jornadas.totalElements} disabled={isFetching} onPageChange={(next) => update("jornadaPagina", String(next), false)} /> : null}
        </>
      )}
    </Card>
  );
}
