import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ConteoEstadoCuadrillaDto } from "../types/dashboard.types";

const ESTADO_LABELS: Record<string, string> = {
  ACTIVA: "Activa",
  EN_ESPERA: "En espera",
  PLANIFICADA: "Planificada",
  SUSPENDIDA: "Suspendida",
  FINALIZADA: "Finalizada",
};

// Mismo orden que el ciclo de vida de la cuadrilla, no alfabetico.
const ORDEN_ESTADOS = ["PLANIFICADA", "EN_ESPERA", "ACTIVA", "SUSPENDIDA", "FINALIZADA"];

const ESTADO_COLORS: Record<string, string> = {
  PLANIFICADA: "var(--color-primary)",
  EN_ESPERA: "var(--color-accent-deep)",
  ACTIVA: "var(--color-success)",
  SUSPENDIDA: "var(--color-error)",
  FINALIZADA: "var(--lt-neutral-300)",
};

interface CuadrillasPorEstadoChartProps {
  data: ConteoEstadoCuadrillaDto[];
}

export function CuadrillasPorEstadoChart({ data }: CuadrillasPorEstadoChartProps) {
  const total = data.reduce((acc, d) => acc + d.cantidad, 0);

  if (total === 0) {
    return (
      <p className="py-6 text-sm text-foreground-muted">
        No hay cuadrillas para mostrar en tu alcance.
      </p>
    );
  }

  const filas = [...data]
    .filter((d) => d.cantidad > 0)
    .sort((a, b) => ORDEN_ESTADOS.indexOf(a.estado) - ORDEN_ESTADOS.indexOf(b.estado))
    .map((d) => ({
      ...d,
      label: ESTADO_LABELS[d.estado] ?? d.estado,
      color: ESTADO_COLORS[d.estado] ?? "var(--lt-neutral-300)",
    }));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filas}
              dataKey="cantidad"
              nameKey="label"
              innerRadius="55%"
              outerRadius="100%"
              paddingAngle={filas.length > 1 ? 2 : 0}
              stroke="var(--color-card)"
              isAnimationActive={false}
            >
              {filas.map((fila) => (
                <Cell key={fila.estado} fill={fila.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${value} ${value === 1 ? "cuadrilla" : "cuadrillas"}`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full space-y-2.5">
        {filas.map((fila) => (
          <li key={fila.estado} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: fila.color }} />
              {fila.label}
            </span>
            <span className="tabular-nums font-semibold text-foreground">{fila.cantidad}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
