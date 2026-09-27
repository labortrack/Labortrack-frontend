import type { TipoLiquidacion } from "../types/categoriaUocra.types";

export const TIPO_LIQUIDACION_LABELS: Record<TipoLiquidacion, string> = {
  POR_HORA: "Por Hora",
  MENSUAL: "Mensual",
};

export const TIPO_LIQUIDACION_OPTIONS = Object.entries(
  TIPO_LIQUIDACION_LABELS,
).map(([value, label]) => ({ value: value as TipoLiquidacion, label }));

export function getTipoLiquidacionLabel(tipo: TipoLiquidacion): string {
  return TIPO_LIQUIDACION_LABELS[tipo] ?? tipo;
}

export function esLiquidacionMensual(tipo: TipoLiquidacion): boolean {
  return tipo === "MENSUAL";
}
