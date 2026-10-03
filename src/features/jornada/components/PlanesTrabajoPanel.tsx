import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock3, FilterX, ListChecks } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
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
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
} from "@/shared/components";
import { usePlanesTrabajo } from "../hooks/usePlanesTrabajo";
import type { EstadoCalculadoPlanTrabajo } from "../types/planTrabajo.types";
import {
  formatDate,
  formatDays,
  formatTime,
} from "../utils/planTrabajoFormatters";
import { PlanTrabajoStatusBadge } from "./PlanTrabajoStatusBadge";

const ALL = "TODOS";
const estadosPlan: EstadoCalculadoPlanTrabajo[] = [
  "PROGRAMADO",
  "VIGENTE",
  "FINALIZADO",
];

export function PlanesTrabajoPanel({
  cuadrillaId,
  embedded = false,
}: {
  cuadrillaId: number;
  embedded?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const estadoParam = searchParams.get("planEstado");
  const estado = estadosPlan.includes(
    estadoParam as EstadoCalculadoPlanTrabajo,
  )
    ? estadoParam!
    : ALL;
  const fechaDesde = searchParams.get("planDesde") ?? "";
  const fechaHasta = searchParams.get("planHasta") ?? "";
  const rawPage = Number(searchParams.get("planPagina") ?? 0);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 0;

  const filtros = useMemo(
    () => ({
      estado:
        estado === ALL
          ? undefined
          : (estado as EstadoCalculadoPlanTrabajo),
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
      page,
      size: 10,
    }),
    [estado, fechaDesde, fechaHasta, page],
  );
  const query = usePlanesTrabajo(cuadrillaId, filtros);
  const response = query.data;
  const planes = response?.planes.content ?? [];
  const hasFilters = estado !== ALL || Boolean(fechaDesde || fechaHasta);

  const clearFilters = () => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("planEstado");
      next.delete("planDesde");
      next.delete("planHasta");
      next.delete("planPagina");
      return next;
    });
  };

  const updateFilter = (
    key: "planEstado" | "planDesde" | "planHasta",
    value: string,
  ) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value || value === ALL) next.delete(key);
      else next.set(key, value);
      next.delete("planPagina");
      return next;
    });
  };

  const updatePage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextPage <= 0) next.delete("planPagina");
      else next.set("planPagina", String(nextPage));
      return next;
    });
  };

  const filters = (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[150px_150px_170px_auto]">
      <label className="space-y-1 text-xs font-semibold text-foreground-muted">
        Desde
        <Input
          type="date"
          value={fechaDesde}
          max={fechaHasta || undefined}
          onChange={(event) => {
            updateFilter("planDesde", event.target.value);
          }}
          className="h-9 bg-card text-xs"
        />
      </label>
      <label className="space-y-1 text-xs font-semibold text-foreground-muted">
        Hasta
        <Input
          type="date"
          value={fechaHasta}
          min={fechaDesde || undefined}
          onChange={(event) => {
            updateFilter("planHasta", event.target.value);
          }}
          className="h-9 bg-card text-xs"
        />
      </label>
      <label className="space-y-1 text-xs font-semibold text-foreground-muted">
        Estado
        <Select
          value={estado}
          onValueChange={(value) => updateFilter("planEstado", value)}
        >
          <SelectTrigger className="h-9 bg-card text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="PROGRAMADO">Programado</SelectItem>
            <SelectItem value="VIGENTE">Vigente</SelectItem>
            <SelectItem value="FINALIZADO">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasFilters}
        onClick={clearFilters}
        className="h-9 self-end"
      >
        <FilterX className="size-4" />
        Limpiar
      </Button>
    </div>
  );

  const panelContent = (
    <CardContent className="p-0" aria-busy={query.isFetching}>
      {query.isFetching && !query.isPending ? (
        <div
          className="flex items-center gap-2 border-b border-border bg-muted px-5 py-2.5 text-xs text-foreground-muted"
          role="status"
          aria-live="polite"
        >
          <Spinner className="size-4" label="Actualizando planes de trabajo" />
          Actualizando resultados…
        </div>
      ) : null}
      {query.isPending ? (
        <LoadingState label="Cargando planes de trabajo..." />
      ) : query.isError ? (
        <ErrorState
          message="No se pudieron cargar los planes de esta cuadrilla."
          onRetry={() => void query.refetch()}
        />
      ) : planes.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No hay planes para esos filtros" : "La cuadrilla aún no tiene planes"}
          description={
            hasFilters
              ? "Probá con otro estado o rango de vigencia."
              : response?.mensaje ?? "Los planes aparecerán aquí cuando sean programados."
          }
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Días de trabajo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planes.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {formatDate(plan.fechaVigenciaDesde)} — {formatDate(plan.fechaVigenciaHasta)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-4 text-foreground-muted" />
                        {formatTime(plan.horaInicioPlanificada)} a {formatTime(plan.horaFinPlanificada)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDays(plan.dias)}</TableCell>
                    <TableCell>
                      <PlanTrabajoStatusBadge estado={plan.estadoCalculado} cancelado={plan.cancelado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const fromParams = new URLSearchParams(location.search);
                          fromParams.set("cuadrilla", String(cuadrillaId));
                          fromParams.set("seccion", "planes");
                          const from = `${location.pathname}?${fromParams.toString()}`;
                          const detailParams = new URLSearchParams({ volver: from });
                          navigate(
                            `/cuadrillas/${cuadrillaId}/planes-trabajo/${plan.id}?${detailParams.toString()}`,
                            { state: { from } },
                          );
                        }}
                      >
                        <ListChecks className="size-4" />
                        Ver plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            page={response!.planes.number}
            totalPages={response!.planes.totalPages}
            totalElements={response!.planes.totalElements}
            disabled={query.isFetching}
            onPageChange={updatePage}
          />
        </>
      )}
    </CardContent>
  );

  if (embedded) {
    return (
      <>
        <div className="border-b border-border bg-subtle p-4 sm:px-6">
          {filters}
        </div>
        {panelContent}
      </>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden border-border shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/20 p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Planes de trabajo
              </h3>
              <p className="mt-0.5 text-xs text-foreground-muted">
                Historial y planificación horaria de la cuadrilla.
              </p>
            </div>
          </div>

          {filters}
        </div>
      </CardHeader>
      {panelContent}
    </Card>
  );
}
