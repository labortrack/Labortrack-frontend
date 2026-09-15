import { z } from "zod";

export const createEstadoObraSchema = z.object({
  nombreEstadoObra: z
    .string()
    .trim()
    .min(1, "El nombre del estado de obra es obligatorio.")
    .max(100, "El nombre del estado no puede superar los 100 caracteres."),
  descripcionEstadoObra: z
    .string()
    .trim()
    .min(1, "La descripción del estado de obra es obligatoria."),
});

export const modifyEstadoObraSchema = z.object({
  descripcionEstadoObra: z
    .string()
    .trim()
    .min(1, "La descripción del estado de obra no puede estar vacía."),
});

export type CreateEstadoObraForm = z.infer<typeof createEstadoObraSchema>;
export type ModifyEstadoObraForm = z.infer<typeof modifyEstadoObraSchema>;
