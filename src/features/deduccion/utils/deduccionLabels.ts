import type { BaseImponible } from "@/features/recibos/types/parametrosLiquidables.types";
import { BASE_IMPONIBLE_LABELS } from "@/features/recibos/utils/parametrosLiquidablesLabels";

// Una deducción porcentual puede usar cualquier base: cuando se calculan las deducciones
// los totales del recibo ya están cerrados. NO_APLICA queda fuera porque es exclusiva
// de los montos fijos y se asigna sola.
export const BASE_IMPONIBLE_PORCENTAJE_OPTIONS = Object.entries(
  BASE_IMPONIBLE_LABELS,
)
  .filter(([value]) => value !== "NO_APLICA")
  .map(([value, label]) => ({ value: value as BaseImponible, label }));
