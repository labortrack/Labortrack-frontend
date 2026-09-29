import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TendenciaAsistenciaPuntoDto } from "../types/dashboard.types";

interface TendenciaAsistenciaChartProps {
  data: TendenciaAsistenciaPuntoDto[];
}

function formatFechaCorta(fecha: string) {
  const [, mes, dia] = fecha.split("-");
  return `${dia}/${mes}`;
}

export function TendenciaAsistenciaChart({ data }: TendenciaAsistenciaChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-sm text-foreground-muted">
        No hay datos para el rango seleccionado.
      </p>
    );
  }

  const chartData = data.map((d) => ({ ...d, fechaCorta: formatFechaCorta(d.fecha) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="presentesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="fechaCorta"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          width={28}
          tick={{ fontSize: 11, fill: "var(--color-foreground-muted)" }}
        />
        <Tooltip />
        <Legend verticalAlign="top" align="right" height={28} iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="presentes"
          name="Presentes"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#presentesFill)"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="ausentes"
          name="Ausentes"
          stroke="var(--color-error)"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
