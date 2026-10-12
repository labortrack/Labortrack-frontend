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

// El eje se ajusta a la nomenclatura mas larga, hasta este tope; las que lo
// superan se recortan con "…" y se leen completas en el title del tick.
const ANCHO_EJE_MAX = 180;
const ANCHO_EJE_MIN = 48;
const MARGEN_TICK = 12;
const MARGEN_IZQUIERDO = 0;
const FUENTE_TICK = '12px "Manrope Variable", "Manrope", system-ui, sans-serif';

let contextoMedicion: CanvasRenderingContext2D | null | undefined;

function medirTexto(texto: string): number {
  if (contextoMedicion === undefined) {
    contextoMedicion = document.createElement("canvas").getContext("2d");
  }
  if (!contextoMedicion) return texto.length * 7.5;
  contextoMedicion.font = FUENTE_TICK;
  return contextoMedicion.measureText(texto).width;
}

function recortarAlAncho(texto: string, anchoMax: number): string {
  if (medirTexto(texto) <= anchoMax) return texto;
  let recortado = texto;
  while (recortado.length > 1 && medirTexto(`${recortado}…`) > anchoMax) {
    recortado = recortado.slice(0, -1);
  }
  return `${recortado}…`;
}

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
  const anchoTextoMax = ANCHO_EJE_MAX - MARGEN_TICK;
  const anchoEje = Math.max(
    ANCHO_EJE_MIN,
    Math.min(
      ANCHO_EJE_MAX,
      Math.ceil(Math.max(...topObras.map((d) => medirTexto(d.nomenclatura)))) + MARGEN_TICK,
    ),
  );

  // Alineado a la izquierda: todas las nomenclaturas arrancan en el borde del
  // grafico (margen izquierdo 0), no pegadas a las barras.
  const renderTick = ({ y, payload }: YAxisTickContentProps) => (
    <text
      x={MARGEN_IZQUIERDO}
      y={y}
      dy={4}
      textAnchor="start"
      fontSize={12}
      fill="var(--color-foreground)"
      className="cursor-default"
    >
      <title>
        {`${payload.value} · ${nombrePorNomenclatura.get(payload.value) ?? ""}`}
      </title>
      {recortarAlAncho(String(payload.value), anchoTextoMax)}
    </text>
  );

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={topObras} layout="vertical" margin={{ top: 0, right: 24, left: MARGEN_IZQUIERDO, bottom: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="nomenclatura"
          width={anchoEje}
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
