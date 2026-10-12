import { z } from "zod";
import {
  baseImponibleSchema,
  textoObligatorioSchema,
  tipoConceptoSchema,
  validarTipoBaseYValor,
  valorParametroSchema,
} from "@/features/recibos/schemas/parametrosLiquidablesSchemas";

// Espejo de ConceptoAdicionalDtoRequest y ValidadorParametrosLiquidables.validarConcepto.
export const conceptoAdicionalSchema = z
  .object({
    nombreConceptoAdicional: textoObligatorioSchema(
      "El nombre del concepto es obligatorio.",
    ),
    descripcionConceptoAdicional: textoObligatorioSchema(
      "La descripción del concepto es obligatoria.",
    ),
    tipoConcepto: tipoConceptoSchema,
    baseImponible: baseImponibleSchema,
    valorConcepto: valorParametroSchema,
    remunerativo: z.boolean({
      error: "Indicá si el concepto es remunerativo.",
    }),
    isGeneral: z.boolean(),
  })
  .superRefine((values, ctx) => {
    validarTipoBaseYValor(ctx, {
      tipoConcepto: values.tipoConcepto,
      baseImponible: values.baseImponible,
      valor: values.valorConcepto,
      campoValor: "valorConcepto",
    });
    // Los totales se arman con los conceptos: calcular uno sobre ellos sería circular.
    if (
      values.tipoConcepto === "PORCENTAJE" &&
      values.baseImponible !== "SALARIO_BASICO"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["baseImponible"],
        message: "Un concepto porcentual solo puede calcularse sobre el salario básico.",
      });
    }
  });

export type ConceptoAdicionalFormValues = z.infer<
  typeof conceptoAdicionalSchema
>;
