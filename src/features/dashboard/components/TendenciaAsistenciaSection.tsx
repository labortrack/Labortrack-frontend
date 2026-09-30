import { useState } from "react";
import { Card, CardContent } from "@/shared/ui";
import { ErrorState, LoadingState } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";
import { useTendenciaAsistencia } from "../hooks/useDashboard";
import { TendenciaAsistenciaChart } from "./TendenciaAsistenciaChart";

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

export function TendenciaAsistenciaSection() {
  const [rangoDias, setRangoDias] = useState(13);
  const tendenciaQuery = useTendenciaAsistencia(haceDiasIso(rangoDias), hoyIso());

  return (
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
  );
}
