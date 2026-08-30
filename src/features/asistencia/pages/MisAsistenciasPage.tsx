import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { AsistenciaHistorialList } from "../components/AsistenciaHistorialList";
import { AsistenciaHoyCard } from "../components/AsistenciaHoyCard";
import {
  useAsistenciaHoy,
  useHistorialAsistencias,
  usePeriodoDisponibleAsistencia,
} from "../hooks/useAsistencias";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
} from "@/shared/components";
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const PAGE_SIZE = 10;

export default function MisAsistenciasPage() {
  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const [anio, setAnio] = useState(anioActual);
  const [page, setPage] = useState(0);
  const asistenciaHoyQuery = useAsistenciaHoy();
  const periodoQuery = usePeriodoDisponibleAsistencia();
  const historialQuery = useHistorialAsistencias(mes, anio, page, PAGE_SIZE);
  const aniosDisponibles = useMemo(() => {
    if (!periodoQuery.data) return [anioActual];

    return Array.from(
      {
        length:
          periodoQuery.data.anioHasta - periodoQuery.data.anioDesde + 1,
      },
      (_, index) => periodoQuery.data.anioHasta - index,
    );
  }, [anioActual, periodoQuery.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mis asistencias"
        description="Consultá tu asistencia actual y el historial de tus jornadas anteriores."
      />

      <section aria-labelledby="asistencia-hoy-title" className="space-y-3">
        <h2
          id="asistencia-hoy-title"
          className="text-base font-semibold text-foreground"
        >
          Asistencia de hoy
        </h2>

        {asistenciaHoyQuery.isPending ? (
          <Card>
            <LoadingState label="Cargando tu asistencia de hoy..." />
          </Card>
        ) : asistenciaHoyQuery.isError ? (
          <Card>
            <ErrorState
              message={
                normalizeApiError(
                  asistenciaHoyQuery.error,
                  "No se pudo cargar tu asistencia de hoy.",
                ).message
              }
              onRetry={() => void asistenciaHoyQuery.refetch()}
            />
          </Card>
        ) : asistenciaHoyQuery.data ? (
          <AsistenciaHoyCard asistencia={asistenciaHoyQuery.data} />
        ) : (
          <Card>
            <EmptyState
              title="No tenés una asistencia esperada para hoy"
              description="Cuando exista una jornada asignada para la fecha actual, aparecerá en esta sección."
            />
          </Card>
        )}
      </section>

      <section
        aria-labelledby="historial-asistencias-title"
        className="space-y-3"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <History className="size-5 text-primary" />
              <h2
                id="historial-asistencias-title"
                className="text-base font-semibold text-foreground"
              >
                Histórico de asistencias
              </h2>
              {historialQuery.isFetching && !historialQuery.isPending ? (
                <Spinner className="size-4 text-primary" />
              ) : null}
            </div>
            <p className="mt-1 text-sm text-foreground-muted">
              Seleccioná el período que querés consultar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:w-[280px]">
            <div>
              <label
                htmlFor="mes-asistencias"
                className="mb-1 block text-xs font-medium text-foreground-muted"
              >
                Mes
              </label>
              <Select
                value={String(mes)}
                onValueChange={(value) => {
                  setMes(Number(value));
                  setPage(0);
                }}
              >
                <SelectTrigger id="mes-asistencias">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESES.map((nombre, index) => (
                    <SelectItem key={nombre} value={String(index + 1)}>
                      {nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="anio-asistencias"
                className="mb-1 block text-xs font-medium text-foreground-muted"
              >
                Año
              </label>
              <Select
                value={String(anio)}
                disabled={periodoQuery.isPending || periodoQuery.isError}
                onValueChange={(value) => {
                  setAnio(Number(value));
                  setPage(0);
                }}
              >
                <SelectTrigger id="anio-asistencias">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aniosDisponibles.map((valor) => (
                    <SelectItem key={valor} value={String(valor)}>
                      {valor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {periodoQuery.isError ? (
                <button
                  type="button"
                  className="mt-1 text-xs font-medium text-error hover:underline"
                  onClick={() => void periodoQuery.refetch()}
                >
                  Reintentar carga de años
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div aria-busy={historialQuery.isFetching}>
          {historialQuery.isPending ? (
            <Card>
              <LoadingState label="Cargando tu historial de asistencias..." />
            </Card>
          ) : historialQuery.isError ? (
            <Card>
              <ErrorState
                message={
                  normalizeApiError(
                    historialQuery.error,
                    "No se pudo cargar el historial del período seleccionado.",
                  ).message
                }
                onRetry={() => void historialQuery.refetch()}
              />
            </Card>
          ) : historialQuery.data.content.length === 0 ? (
            <Card>
              <EmptyState
                title="No hay asistencias para este período"
                description={`No encontramos registros para ${MESES[mes - 1].toLowerCase()} de ${anio}.`}
              />
            </Card>
          ) : (
            <div>
              <AsistenciaHistorialList
                asistencias={historialQuery.data.content}
              />
              <Pagination
                page={historialQuery.data.number}
                totalPages={historialQuery.data.totalPages}
                totalElements={historialQuery.data.totalElements}
                disabled={historialQuery.isFetching}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
