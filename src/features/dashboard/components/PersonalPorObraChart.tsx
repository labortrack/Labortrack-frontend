import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ConteoPersonalObraDto } from "../types/dashboard.types";

interface PersonalPorObraChartProps {
  data: ConteoPersonalObraDto[];
}

export function PersonalPorObraChart({ data }: PersonalPorObraChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center text-sm text-muted-foreground">
        Sin personal asignado para mostrar.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="nombreObra"
          width={110}
          tick={{ fontSize: 11 }}
        />
        <Tooltip formatter={(value) => [`${value} operarios`, "Personal"]} />
        <Bar dataKey="cantidad" fill="#0036a4" radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
