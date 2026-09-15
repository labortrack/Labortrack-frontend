export interface EstadoStyle {
  bg: string;
  text: string;
  dot: string;
  hex: string;
}

export const ESTADO_STYLES: Record<string, EstadoStyle> = {
  PLANIFICADA: {
    bg: "bg-[#e8f0ff]",
    text: "text-[#0036a4]",
    dot: "bg-[#0036a4]",
    hex: "#0036a4",
  },
  "EN EJECUCIÓN": {
    bg: "bg-[#e6f4ee]",
    text: "text-[#004c28]",
    dot: "bg-[#004c28]",
    hex: "#004c28",
  },
  "EN FUNDACIÓN": {
    bg: "bg-[#fff8e1]",
    text: "text-[#b45309]",
    dot: "bg-[#b45309]",
    hex: "#b45309",
  },
  SUSPENDIDA: {
    bg: "bg-[#fff3e0]",
    text: "text-[#e0672a]",
    dot: "bg-[#e0672a]",
    hex: "#e0672a",
  },
  "EN INSPECCIÓN": {
    bg: "bg-[#f3e8ff]",
    text: "text-[#7c3aed]",
    dot: "bg-[#7c3aed]",
    hex: "#7c3aed",
  },
  FINALIZADA: {
    bg: "bg-[#f0f0f0]",
    text: "text-[#636363]",
    dot: "bg-[#636363]",
    hex: "#636363",
  },
  ARCHIVADA: {
    bg: "bg-[#f5f5f5]",
    text: "text-[#888888]",
    dot: "bg-[#888888]",
    hex: "#888888",
  },
  DETENIDA: {
    bg: "bg-[#fff1f1]",
    text: "text-[#ba1a1a]",
    dot: "bg-[#ba1a1a]",
    hex: "#ba1a1a",
  },
  CANCELADA: {
    bg: "bg-[#f5f5f5]",
    text: "text-[#888888]",
    dot: "bg-[#888888]",
    hex: "#888888",
  },
};

const DEFAULT_STYLE: EstadoStyle = {
  bg: "bg-[#f0eded]",
  text: "text-[#636363]",
  dot: "bg-[#636363]",
  hex: "#636363",
};

export function getEstadoStyle(estado?: string | null): EstadoStyle {
  if (!estado) return DEFAULT_STYLE;
  return ESTADO_STYLES[estado.toUpperCase()] ?? DEFAULT_STYLE;
}
