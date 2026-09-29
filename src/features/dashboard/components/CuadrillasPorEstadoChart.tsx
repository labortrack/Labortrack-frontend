import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ConteoEstadoCuadrillaDto } from "../types/dashboard.types";

const ESTADO_LABELS: Record<string, string> = {
  ACTIVA: "Activa",
  EN_ESPERA: "En Espera",
  PLANIFICADA: "Planificada",
  SUSPENDIDA: "Suspendida",
  FINALIZADA: "Finalizada",
};

const ESTADO_COLORS: Record<string, string> = {
  ACTIVA: "#10b981",
  EN_ESPERA: "#f59e0b",
  PLANIFICADA: "#0ea5e9",
  SUSPENDIDA: "#f43f5e",
  FINALIZADA: "#71717a",
};

interface CuadrillasPorEstadoChartProps {
  data: ConteoEstadoCuadrillaDto[];
}

export function CuadrillasPorEstadoChart({ data }: CuadrillasPorEstadoChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">
        Sin cuadrillas para mostrar.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: ESTADO_LABELS[d.estado] ?? d.estado,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="cantidad"
          nameKey="label"
          cx="50%"
          cy="45%"
          innerRadius={52}
          outerRadius={80}
          paddingAngle={3}
        >
          {chartData.map((entry) => (
            <Cell key={entry.estado} fill={ESTADO_COLORS[entry.estado] ?? "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} cuadrillas`, ""]} />
        <Legend verticalAlign="bottom" height={40} iconSize={10} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
