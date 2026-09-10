import { z } from "zod";

export const tipoLiquidacionSchema = z.enum(["POR_HORA", "MENSUAL"], {
  error: "Seleccioná un tipo de liquidación.",
});

export const categoriaUocraSchema = z.object({
  nombreCategoria: z
    .string()
    .trim()
    .min(1, "El nombre de la categoría es obligatorio.")
    .max(100, "El nombre de la categoría no puede superar los 100 caracteres."),
  tipoLiquidacion: tipoLiquidacionSchema,
  valorHoraBasico: z
    .number({ error: "El valor hora básico es obligatorio." })
    .positive("El valor hora básico debe ser mayor a 0."),
});

export type CategoriaUocraFormValues = z.infer<typeof categoriaUocraSchema>;
