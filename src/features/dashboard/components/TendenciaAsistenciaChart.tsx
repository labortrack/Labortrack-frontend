import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
      <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">
        Sin datos para el rango seleccionado.
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, fechaCorta: formatFechaCorta(d.fecha) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="fechaCorta" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
        <Tooltip />
        <Legend verticalAlign="bottom" height={32} iconSize={10} wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="presentes"
          name="Presentes"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
        <Line
          type="monotone"
          dataKey="ausentes"
          name="Ausentes"
          stroke="#f43f5e"
          strokeWidth={2}
          dot={{ r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
