import { z } from "zod";

export const anulacionRegistroSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, "El motivo de anulación es obligatorio.")
    .max(500, "El motivo no puede superar los 500 caracteres."),
});

export type AnulacionRegistroForm = z.infer<
  typeof anulacionRegistroSchema
>;

export const anulacionAsistenciaSchema = anulacionRegistroSchema;

export type AnulacionAsistenciaForm = z.infer<
  typeof anulacionAsistenciaSchema
>;
