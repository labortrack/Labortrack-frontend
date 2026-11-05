import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/shared/ui";
import { ErrorState, LoadingState } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";
import { useLecturaRecibos } from "../hooks/useDashboard";
import type { LecturaRecibosPeriodoDto } from "../types/dashboard.types";

const VENTANAS_MESES = [3, 6, 9];

const porcentajeFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 1,
});

function formatPorcentaje(valor: number) {
  return `${porcentajeFormatter.format(valor)}%`;
}

/**
 * Indicador de control de entrega de recibos (US039): qué parte de los recibos publicados
 * ya confirmaron sus empleados. Solo para quien tiene acceso a recibos (ADMIN y CONTADOR).
 */
export function LecturaRecibosSection() {
  const [meses, setMeses] = useState(6);
  const query = useLecturaRecibos(meses);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Lectura de recibos de sueldo
            </h3>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Porcentaje de recibos publicados que los empleados confirmaron, por período.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 self-start rounded-control bg-subtle p-1">
            {VENTANAS_MESES.map((opcion) => (
              <button
                key={opcion}
                type="button"
                onClick={() => setMeses(opcion)}
                className={cn(
                  "rounded-control px-2.5 py-1 text-xs font-medium transition-colors",
                  opcion === meses
                    ? "bg-card text-foreground shadow-soft"
                    : "text-foreground-muted hover:text-foreground"
                )}
              >
                {opcion} meses
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {query.isPending ? (
            <LoadingState label="Cargando lectura de recibos..." />
          ) : query.isError ? (
            <ErrorState
              message={
                normalizeApiError(
                  query.error,
                  "No se pudo cargar la lectura de recibos."
                ).message
              }
              onRetry={() => void query.refetch()}
            />
          ) : (
            <LecturaRecibosContenido data={query.data} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LecturaRecibosContenido({ data }: { data: LecturaRecibosPeriodoDto[] }) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-sm text-foreground-muted">
        No hay recibos publicados en el rango seleccionado.
      </p>
    );
  }

  // El backend los devuelve del más viejo al más nuevo: el último es el período más reciente.
  const ultimo = data[data.length - 1];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-foreground-muted">{ultimo.descripcionPeriodo}</p>
        <p className="text-2xl font-semibold tabular-nums text-foreground">
          {formatPorcentaje(ultimo.porcentajeLeidos)}
        </p>
        <p className="text-xs text-foreground-muted">
          {ultimo.recibosLeidos} de {ultimo.recibosPublicados} recibos leídos
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="descripcionPeriodo"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(valor: number) => `${valor}%`}
            tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
          />
          <Tooltip
            formatter={(valor) => [formatPorcentaje(Number(valor)), "Leídos"]}
          />
          <Bar
            dataKey="porcentajeLeidos"
            name="Leídos"
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
