import { formatCurrency } from "@/shared/utils/currency";
import type {
  BaseImponible,
  TipoConcepto,
} from "../types/parametrosLiquidables.types";

export const TIPO_CONCEPTO_LABELS: Record<TipoConcepto, string> = {
  FIJO: "Monto Fijo",
  PORCENTAJE: "Porcentaje",
};

export const BASE_IMPONIBLE_LABELS: Record<BaseImponible, string> = {
  SALARIO_BASICO: "Salario Básico",
  TOTAL_REMUNERATIVO: "Total Remunerativo",
  TOTAL_NO_REMUNERATIVO: "Total No Remunerativo",
  TOTAL_BRUTO: "Total Bruto",
  NO_APLICA: "No aplica",
};

export const TIPO_CONCEPTO_OPTIONS = Object.entries(TIPO_CONCEPTO_LABELS).map(
  ([value, label]) => ({ value: value as TipoConcepto, label }),
);

const porcentajeFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 2,
});

export function formatValorParametro(
  tipoConcepto: TipoConcepto,
  valor: number,
): string {
  return tipoConcepto === "PORCENTAJE"
    ? `${porcentajeFormatter.format(valor)} %`
    : formatCurrency(valor);
}
