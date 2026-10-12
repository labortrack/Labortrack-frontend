import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type YAxisTickContentProps,
} from "recharts";
import type { ConteoPersonalObraDto } from "../types/dashboard.types";

// Solo las obras con mas operarios, para que el grafico no crezca sin limite.
const MAX_OBRAS = 5;

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

  // sort es estable: ante empate se mantiene el orden por nombre que envia el backend.
  const topObras = [...data].sort((a, b) => b.cantidad - a.cantidad).slice(0, MAX_OBRAS);

  const alturaFila = 34;
  const altura = Math.max(120, topObras.length * alturaFila);
  const nombrePorNomenclatura = new Map(topObras.map((d) => [d.nomenclatura, d.nombreObra]));

  const renderTick = ({ x, y, payload }: YAxisTickContentProps) => (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={12}
      fill="var(--color-foreground)"
      className="cursor-default"
    >
      <title>{nombrePorNomenclatura.get(payload.value) ?? payload.value}</title>
      {payload.value}
    </text>
  );

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={topObras} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="nomenclatura"
          width={96}
          axisLine={false}
          tickLine={false}
          tick={renderTick}
        />
        {/* El eje muestra la nomenclatura (corta); el nombre completo va en el tooltip. */}
        <Tooltip
          cursor={{ fill: "var(--color-subtle)" }}
          labelFormatter={(_, payload) => {
            const obra = payload?.[0]?.payload as ConteoPersonalObraDto | undefined;
            return obra ? `${obra.nomenclatura} · ${obra.nombreObra}` : "";
          }}
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
