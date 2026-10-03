import { useMemo, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  FilterX,
  HardHat,
  Pencil,
  Plus,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import {
  BackLink,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
} from "@/shared/components";
import { usePlanTrabajoDetalle } from "../hooks/usePlanesTrabajo";
import type {
  EstadoJornadaTrabajo,
  TipoJornada,
} from "../types/planTrabajo.types";
import {
  decisionLabels,
  estadoJornadaLabels,
  formatDate,
  formatDateTime,
  formatDays,
  formatTime,
  tipoJornadaLabels,
} from "../utils/planTrabajoFormatters";
import { PlanTrabajoStatusBadge } from "../components/PlanTrabajoStatusBadge";
import { PlanTrabajoFormDialog } from "../components/PlanTrabajoFormDialog";
import { CrearJornadaExtraordinariaDialog } from "../components/CrearJornadaExtraordinariaDialog";

const ALL = "TODOS";
const tiposJornada = Object.keys(tipoJornadaLabels) as TipoJornada[];
const estadosJornada = Object.keys(estadoJornadaLabels) as EstadoJornadaTrabajo[];

function JornadaStatusBadge({ estado }: { estado: EstadoJornadaTrabajo }) {
  const variant =
    estado === "FINALIZADA"
      ? "success"
      : estado === "EN_CURSO"
        ? "primary"
        : estado === "ANULADA"
          ? "error"
          : estado === "NO_TRABAJADA"
            ? "warning"
            : "neutral";
  return <Badge variant={variant}>{estadoJornadaLabels[estado]}</Badge>;
}

export default function PlanTrabajoDetailPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [extraordinaryOpen, setExtraordinaryOpen] = useState(false);
  const { cuadrillaId: rawCuadrillaId, planId: rawPlanId } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const cuadrillaId = Number(rawCuadrillaId);
  const planId = Number(rawPlanId);
  const fechaDesde = searchParams.get("jornadaDesde") ?? "";
  const fechaHasta = searchParams.get("jornadaHasta") ?? "";
  const tipoParam = searchParams.get("jornadaTipo");
  const tipo = tiposJornada.includes(tipoParam as TipoJornada)
    ? tipoParam!
    : ALL;
  const estadoParam = searchParams.get("jornadaEstado");
  const estado = estadosJornada.includes(estadoParam as EstadoJornadaTrabajo)
    ? estadoParam!
    : ALL;
  const rawPage = Number(searchParams.get("jornadaPagina") ?? 0);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 0;

  const filtros = useMemo(
    () => ({
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      tipo: tipo === ALL ? undefined : (tipo as TipoJornada),
      estado:
        estado === ALL ? undefined : (estado as EstadoJornadaTrabajo),
      page,
      size: 20,
    }),
    [estado, fechaDesde, fechaHasta, page, tipo],
  );
  const query = usePlanTrabajoDetalle(cuadrillaId, planId, filtros);
  const plan = query.data;
  const hasFilters = Boolean(fechaDesde || fechaHasta) || tipo !== ALL || estado !== ALL;
  const stateBackTo = (location.state as { from?: string } | null)?.from;
  const urlBackTo = searchParams.get("volver");
  const isSafeBackTarget = (value: string | null | undefined) =>
    Boolean(
      value &&
        (value.startsWith("/obras/") || value.startsWith("/mi-cuadrilla")),
    );
  const backTo = isSafeBackTarget(stateBackTo)
    ? stateBackTo!
    : isSafeBackTarget(urlBackTo)
      ? urlBackTo!
      : "/dashboard";

  const clearFilters = () => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("jornadaDesde");
      next.delete("jornadaHasta");
      next.delete("jornadaTipo");
      next.delete("jornadaEstado");
      next.delete("jornadaPagina");
      return next;
    });
  };

  const updateFilter = (
    key: "jornadaDesde" | "jornadaHasta" | "jornadaTipo" | "jornadaEstado",
    value: string,
  ) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === ALL) next.delete(key);
      else next.set(key, value);
      next.delete("jornadaPagina");
      return next;
    });
  };

  const updatePage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextPage <= 0) next.delete("jornadaPagina");
      else next.set("jornadaPagina", String(nextPage));
      return next;
    });
  };

  if (query.isPending) {
    return <Card><LoadingState label="Cargando detalle del plan..." /></Card>;
  }
  if (query.isError || !plan) {
    return (
      <div className="space-y-6">
        <BackLink to={backTo} label="Volver" />
        <Card>
          <ErrorState
            message="No se pudo cargar el plan de trabajo solicitado."
            onRetry={() => void query.refetch()}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <BackLink to={backTo} label="Volver a planes de trabajo" />
        <PageHeader
          title={`Plan de trabajo #${plan.id}`}
          description={`${plan.cuadrillaNombre} • ${plan.obraNombre}`}
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              {plan.accionesDisponibles.includes(
                "CREAR_JORNADA_EXTRAORDINARIA",
              ) ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setExtraordinaryOpen(true)}
                >
                  <Plus className="size-4" />
                  Crear jornada extraordinaria
                </Button>
              ) : null}
              {plan.accionesDisponibles.includes(
                "MODIFICAR_PLAN_TRABAJO",
              ) ? (
                <Button type="button" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Modificar plan de trabajo
                </Button>
              ) : null}
              <PlanTrabajoStatusBadge
                estado={plan.estadoCalculado}
                cancelado={plan.cancelado}
              />
            </div>
          }
        />
      </div>

      <Card className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Vigencia</p>
          <p className="mt-1 font-semibold">{formatDate(plan.fechaVigenciaDesde)} — {formatDate(plan.fechaVigenciaHasta)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Horario planificado</p>
          <p className="mt-1 flex items-center gap-2 font-semibold"><Clock3 className="size-4 text-primary" />{formatTime(plan.horaInicioPlanificada)} a {formatTime(plan.horaFinPlanificada)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Días de trabajo</p>
          <p className="mt-1 font-semibold">{formatDays(plan.dias)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Cancelación</p>
          <p className="mt-1 font-semibold">{plan.fechaHoraCancelacion ? formatDateTime(plan.fechaHoraCancelacion) : "—"}</p>
        </div>
      </Card>

      <Card className="overflow-hidden" aria-busy={query.isFetching}>
        <div className="border-b border-border bg-muted/20 p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><CalendarDays className="size-5" /></div>
              <div>
                <h2 className="font-bold">Jornadas generadas</h2>
                <p className="text-xs text-foreground-muted">Solo se muestran jornadas pertenecientes a este plan.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[145px_145px_160px_170px_auto]">
              <Input type="date" aria-label="Fecha desde" value={fechaDesde} max={fechaHasta || undefined} onChange={(e) => updateFilter("jornadaDesde", e.target.value)} className="h-9 bg-card text-xs" />
              <Input type="date" aria-label="Fecha hasta" value={fechaHasta} min={fechaDesde || undefined} onChange={(e) => updateFilter("jornadaHasta", e.target.value)} className="h-9 bg-card text-xs" />
              <Select value={tipo} onValueChange={(value) => updateFilter("jornadaTipo", value)}>
                <SelectTrigger className="h-9 bg-card text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos los tipos</SelectItem>
                  {Object.entries(tipoJornadaLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={estado} onValueChange={(value) => updateFilter("jornadaEstado", value)}>
                <SelectTrigger className="h-9 bg-card text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos los estados</SelectItem>
                  {Object.entries(estadoJornadaLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-9" disabled={!hasFilters} onClick={clearFilters}><FilterX className="size-4" />Limpiar</Button>
            </div>
          </div>
        </div>

        {query.isFetching && !query.isPending ? (
          <div
            className="flex items-center gap-2 border-b border-border bg-muted px-5 py-2.5 text-xs text-foreground-muted"
            role="status"
            aria-live="polite"
          >
            <Spinner className="size-4" label="Actualizando jornadas" />
            Actualizando resultados…
          </div>
        ) : null}

        {plan.jornadas.content.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No hay jornadas para esos filtros" : "Este plan no tiene jornadas visibles"}
            description={hasFilters ? "Probá con otro rango, tipo o estado." : "Las jornadas generadas aparecerán aquí según tu nivel de acceso."}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Día no laborable</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Origen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.jornadas.content.map((jornada) => (
                    <TableRow key={jornada.id}>
                      <TableCell className="font-semibold">{formatDate(jornada.fecha)}</TableCell>
                      <TableCell>{formatTime(jornada.horaInicioPlanificada)} a {formatTime(jornada.horaFinPlanificada)}</TableCell>
                      <TableCell>{tipoJornadaLabels[jornada.tipo]}</TableCell>
                      <TableCell>{decisionLabels[jornada.decisionDiaNoLaborable]}</TableCell>
                      <TableCell><JornadaStatusBadge estado={jornada.estado} /></TableCell>
                      <TableCell>{jornada.extraordinaria ? <Badge variant="warning">Extraordinaria</Badge> : <span className="inline-flex items-center gap-1.5 text-sm text-foreground-muted"><HardHat className="size-4" />Planificada</span>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination page={plan.jornadas.number} totalPages={plan.jornadas.totalPages} totalElements={plan.jornadas.totalElements} disabled={query.isFetching} onPageChange={updatePage} />
          </>
        )}
      </Card>

      {editOpen ? (
        <PlanTrabajoFormDialog
          mode="edit"
          cuadrillaId={plan.cuadrillaId}
          cuadrillaNombre={plan.cuadrillaNombre}
          obraNombre={plan.obraNombre}
          plan={plan}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
      {extraordinaryOpen ? (
        <CrearJornadaExtraordinariaDialog
          plan={plan}
          onClose={() => setExtraordinaryOpen(false)}
        />
      ) : null}
    </div>
  );
}
