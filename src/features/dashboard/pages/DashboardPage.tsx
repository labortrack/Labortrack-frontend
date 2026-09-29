import { useState } from "react";
import { Card, CardContent } from "@/shared/ui";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";
import { useDashboardResumen, useTendenciaAsistencia } from "../hooks/useDashboard";
import { ResumenHeroPanel } from "../components/ResumenHeroPanel";
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

const RANGOS_TENDENCIA = [
  { dias: 6, label: "7 días" },
  { dias: 13, label: "14 días" },
  { dias: 29, label: "30 días" },
];

export default function DashboardPage() {
  const [rangoDias, setRangoDias] = useState(13);

  const resumenQuery = useDashboardResumen();
  const tendenciaQuery = useTendenciaAsistencia(haceDiasIso(rangoDias), hoyIso());

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
          <ResumenHeroPanel
            asistenciaPorcentaje={resumenQuery.data.asistenciaHoyPorcentaje}
            empleadosActivos={resumenQuery.data.totalEmpleadosActivos}
            obrasActivas={resumenQuery.data.totalObrasActivas}
            ausenciasHoy={resumenQuery.data.ausenciasHoy}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Cuadrillas por frente
                </h3>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  Distribución vigente según tu alcance.
                </p>
                <div className="mt-4">
                  <CuadrillasPorEstadoChart data={resumenQuery.data.cuadrillasPorEstado} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-foreground">Personal por obra</h3>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  Operarios vigentes en cada frente de trabajo.
                </p>
                <div className="mt-4">
                  <PersonalPorObraChart data={resumenQuery.data.personalPorObra} />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Tendencia de asistencia
              </h3>
              <p className="mt-0.5 text-xs text-foreground-muted">
                Operarios presentes y ausentes por día.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 self-start rounded-control bg-subtle p-1">
              {RANGOS_TENDENCIA.map((rango) => (
                <button
                  key={rango.dias}
                  type="button"
                  onClick={() => setRangoDias(rango.dias)}
                  className={cn(
                    "rounded-control px-2.5 py-1 text-xs font-medium transition-colors",
                    rango.dias === rangoDias
                      ? "bg-card text-foreground shadow-soft"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {rango.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
