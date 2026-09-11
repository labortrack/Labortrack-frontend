import { z } from "zod";

export const zonaSchema = z.object({
  nombreZona: z
    .string()
    .trim()
    .min(1, "El nombre de la zona es obligatorio.")
    .max(100, "El nombre de la zona no puede superar los 100 caracteres."),
});

export type ZonaFormValues = z.infer<typeof zonaSchema>;
