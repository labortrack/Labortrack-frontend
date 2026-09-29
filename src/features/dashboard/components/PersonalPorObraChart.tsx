import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ConteoPersonalObraDto } from "../types/dashboard.types";

interface PersonalPorObraChartProps {
  data: ConteoPersonalObraDto[];
}

export function PersonalPorObraChart({ data }: PersonalPorObraChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-sm text-foreground-muted">
        No hay personal asignado en tu alcance.
      </p>
    );
  }

  const alturaFila = 34;
  const altura = Math.max(120, data.length * alturaFila);

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="nombreObra"
          width={120}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "var(--color-foreground)" }}
        />
        <Tooltip
          cursor={{ fill: "var(--color-subtle)" }}
          formatter={(value) => [`${value} operarios`, ""]}
        />
        <Bar dataKey="cantidad" fill="var(--color-primary)" radius={[0, 3, 3, 0]} maxBarSize={14}>
          <LabelList
            dataKey="cantidad"
            position="right"
            style={{ fill: "var(--color-foreground)", fontSize: 12, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
