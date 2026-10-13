import { z } from "zod";
import {
  baseImponibleSchema,
  textoObligatorioSchema,
  tipoConceptoSchema,
  validarTipoBaseYValor,
  valorParametroSchema,
} from "@/features/recibos/schemas/parametrosLiquidablesSchemas";

// Espejo de DeduccionDtoRequest y ValidadorParametrosLiquidables.validarDeduccion.
export const deduccionSchema = z
  .object({
    nombreDeduccion: textoObligatorioSchema(
      "El nombre de la deducción es obligatorio.",
    ),
    descripcionDeduccion: textoObligatorioSchema(
      "La descripción de la deducción es obligatoria.",
    ),
    tipoConcepto: tipoConceptoSchema,
    baseImponible: baseImponibleSchema,
    valorDeduccion: valorParametroSchema,
    isGeneral: z.boolean(),
  })
  .superRefine((values, ctx) =>
    validarTipoBaseYValor(ctx, {
      tipoConcepto: values.tipoConcepto,
      baseImponible: values.baseImponible,
      valor: values.valorDeduccion,
      campoValor: "valorDeduccion",
    }),
  );

export type DeduccionFormValues = z.infer<typeof deduccionSchema>;
