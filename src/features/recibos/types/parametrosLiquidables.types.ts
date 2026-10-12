// Tipos compartidos por los catálogos de Deducciones y Conceptos Adicionales.

export type TipoConcepto = "FIJO" | "PORCENTAJE";

export type BaseImponible =
  | "SALARIO_BASICO"
  | "TOTAL_REMUNERATIVO"
  | "TOTAL_NO_REMUNERATIVO"
  | "TOTAL_BRUTO"
  | "NO_APLICA";
