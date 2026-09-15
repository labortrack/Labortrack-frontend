import { z } from "zod";

const motivoSchema = z
  .string()
  .trim()
  .min(1, "El motivo es obligatorio.")
  .max(500, "El motivo no puede superar los 500 caracteres.");

export const registroIngresoManualSchema = z.object({
  hora: z.string().min(1, "La hora de ingreso es obligatoria."),
  motivo: motivoSchema,
});

export const registroEgresoManualSchema = z.object({
  hora: z.string().min(1, "La hora de egreso es obligatoria."),
  motivo: motivoSchema,
});

export type RegistroManualForm = z.infer<
  typeof registroIngresoManualSchema
>;
