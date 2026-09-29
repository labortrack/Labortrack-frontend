import { useState } from "react";
import { Building2, CalendarCheck, UserX, Users } from "lucide-react";
import { Card, CardContent, Input, Label } from "@/shared/ui";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useDashboardResumen, useTendenciaAsistencia } from "../hooks/useDashboard";
import { KpiCard } from "../components/KpiCard";
import { CuadrillasPorEstadoChart } from "../components/CuadrillasPorEstadoChart";
import { PersonalPorObraChart } from "../components/PersonalPorObraChart";
import { TendenciaAsistenciaChart } from "../components/TendenciaAsistenciaChart";

function hoyIso() {
  return new Date().toISOString().slice(0, 10);
}

function haceDiasIso(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [fechaDesde, setFechaDesde] = useState(haceDiasIso(13));
  const [fechaHasta, setFechaHasta] = useState(hoyIso());

  const resumenQuery = useDashboardResumen();
  const tendenciaQuery = useTendenciaAsistencia(fechaDesde, fechaHasta);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Indicadores clave del sistema, según tu alcance operativo."
      />

      {resumenQuery.isPending ? (
        <Card className="p-8">
          <LoadingState label="Cargando indicadores..." />
        </Card>
      ) : resumenQuery.isError ? (
        <Card className="p-6">
          <ErrorState
            message={
              normalizeApiError(
                resumenQuery.error,
                "No se pudieron cargar los indicadores del dashboard."
              ).message
            }
            onRetry={() => void resumenQuery.refetch()}
          />
        </Card>
      ) : (
        <>
          {/* Fila superior: scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Empleados Activos"
              value={String(resumenQuery.data.totalEmpleadosActivos)}
              icon={Users}
              iconColor="text-blue-500"
              bgGradient="from-blue-500/10 via-blue-500/5 to-transparent"
              borderColor="border-blue-500/20"
            />
            <KpiCard
              title="Obras Activas"
              value={String(resumenQuery.data.totalObrasActivas)}
              icon={Building2}
              iconColor="text-emerald-500"
              bgGradient="from-emerald-500/10 via-emerald-500/5 to-transparent"
              borderColor="border-emerald-500/20"
            />
            <KpiCard
              title="Asistencia Hoy"
              value={`${resumenQuery.data.asistenciaHoyPorcentaje.toFixed(1)}%`}
              icon={CalendarCheck}
              iconColor="text-amber-500"
              bgGradient="from-amber-500/10 via-amber-500/5 to-transparent"
              borderColor="border-amber-500/20"
            />
            <KpiCard
              title="Ausencias Hoy"
              value={String(resumenQuery.data.ausenciasHoy)}
              icon={UserX}
              iconColor="text-rose-500"
              bgGradient="from-rose-500/10 via-rose-500/5 to-transparent"
              borderColor="border-rose-500/20"
            />
          </div>

          {/* Fila media: datos operativos críticos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Cuadrillas por Estado
                </h3>
                <CuadrillasPorEstadoChart data={resumenQuery.data.cuadrillasPorEstado} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Personal por Obra
                </h3>
                <PersonalPorObraChart data={resumenQuery.data.personalPorObra} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Fila inferior: tendencias analíticas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Tendencia de Asistencia
            </h3>
            <div className="flex items-center gap-2">
              <div>
                <Label htmlFor="tendencia-desde" className="sr-only">
                  Desde
                </Label>
                <Input
                  id="tendencia-desde"
                  type="date"
                  value={fechaDesde}
                  max={fechaHasta}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <span className="text-xs text-muted-foreground">—</span>
              <div>
                <Label htmlFor="tendencia-hasta" className="sr-only">
                  Hasta
                </Label>
                <Input
                  id="tendencia-hasta"
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde}
                  max={hoyIso()}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {tendenciaQuery.isPending ? (
            <LoadingState label="Cargando tendencia..." />
          ) : tendenciaQuery.isError ? (
            <ErrorState
              message={
                normalizeApiError(
                  tendenciaQuery.error,
                  "No se pudo cargar la tendencia de asistencia."
                ).message
              }
              onRetry={() => void tendenciaQuery.refetch()}
            />
          ) : (
            <TendenciaAsistenciaChart data={tendenciaQuery.data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
