import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

export function PlanesTrabajoPanel({
  cuadrillaId,
  embedded = false,
}: {
  cuadrillaId: number;
  embedded?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [estado, setEstado] = useState<string>(ALL);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [page, setPage] = useState(0);

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
    setEstado(ALL);
    setFechaDesde("");
    setFechaHasta("");
    setPage(0);
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
            setFechaDesde(event.target.value);
            setPage(0);
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
            setFechaHasta(event.target.value);
            setPage(0);
          }}
          className="h-9 bg-card text-xs"
        />
      </label>
      <label className="space-y-1 text-xs font-semibold text-foreground-muted">
        Estado
        <Select
          value={estado}
          onValueChange={(value) => {
            setEstado(value);
            setPage(0);
          }}
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
    <CardContent className="p-0">
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
                        onClick={() =>
                          navigate(`/cuadrillas/${cuadrillaId}/planes-trabajo/${plan.id}`, {
                            state: { from: `${location.pathname}${location.search}` },
                          })
                        }
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
            onPageChange={setPage}
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
