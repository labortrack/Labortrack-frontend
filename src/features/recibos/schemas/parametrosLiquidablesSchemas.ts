import { z } from "zod";
import type {
  BaseImponible,
  TipoConcepto,
} from "../types/parametrosLiquidables.types";

// Espejo de ValidadorParametrosLiquidables del backend (RF046, RF047): reglas comunes
// a deducciones y conceptos adicionales.
const PORCENTAJE_MINIMO = 0.1;
const PORCENTAJE_MAXIMO = 100;
const MONTO_MAXIMO = 9_999_999_999.99;

export const tipoConceptoSchema = z.enum(["FIJO", "PORCENTAJE"], {
  error: "Seleccioná el tipo.",
});

export const baseImponibleSchema = z.enum(
  [
    "SALARIO_BASICO",
    "TOTAL_REMUNERATIVO",
    "TOTAL_NO_REMUNERATIVO",
    "TOTAL_BRUTO",
    "NO_APLICA",
  ],
  { error: "Seleccioná la base imponible." },
);

export const valorParametroSchema = z
  .number({ error: "El valor es obligatorio." })
  .positive("El valor debe ser mayor a 0.")
  .max(MONTO_MAXIMO, "El valor es demasiado grande.")
  .refine(
    (valor) => /^\d+(\.\d{1,2})?$/.test(String(valor)),
    "El valor admite hasta 2 decimales.",
  );

export function textoObligatorioSchema(mensaje: string) {
  return z
    .string()
    .trim()
    .min(1, mensaje)
    .max(255, "No puede superar los 255 caracteres.");
}

/**
 * Un porcentaje vive entre 0,1 y 100 y necesita una base sobre la cual calcularse;
 * un monto fijo no se calcula sobre nada, así que su base es NO_APLICA.
 */
export function validarTipoBaseYValor(
  ctx: z.RefinementCtx,
  {
    tipoConcepto,
    baseImponible,
    valor,
    campoValor,
  }: {
    tipoConcepto: TipoConcepto;
    baseImponible: BaseImponible;
    valor: number;
    campoValor: string;
  },
) {
  if (tipoConcepto === "PORCENTAJE") {
    if (valor < PORCENTAJE_MINIMO || valor > PORCENTAJE_MAXIMO) {
      ctx.addIssue({
        code: "custom",
        path: [campoValor],
        message: `El porcentaje debe estar entre ${PORCENTAJE_MINIMO} y ${PORCENTAJE_MAXIMO}.`,
      });
    }
    if (baseImponible === "NO_APLICA") {
      ctx.addIssue({
        code: "custom",
        path: ["baseImponible"],
        message: "Un porcentaje necesita una base imponible sobre la cual calcularse.",
      });
    }
  } else if (baseImponible !== "NO_APLICA") {
    ctx.addIssue({
      code: "custom",
      path: ["baseImponible"],
      message: "Un monto fijo no se calcula sobre ninguna base imponible.",
    });
  }
}
