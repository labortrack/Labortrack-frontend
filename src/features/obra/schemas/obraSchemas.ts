import { z } from "zod";

export const createObraSchema = z.object({
  nombreObra: z
    .string()
    .trim()
    .min(1, "El nombre de la obra es obligatorio.")
    .max(150, "El nombre no puede superar los 150 caracteres."),
  nomenclatura: z
    .string()
    .trim()
    .min(1, "La nomenclatura es obligatoria.")
    .max(50, "La nomenclatura no puede superar los 50 caracteres."),
  pais: z.string().trim().min(1, "El país es obligatorio."),
  provincia: z.string().trim().min(1, "La provincia es obligatoria."),
  localidad: z.string().trim().min(1, "La localidad es obligatoria."),
  motivoCambio: z
    .string()
    .trim()
    .min(1, "Debe especificar el motivo o justificación del alta de la obra."),
});

export const modifyObraSchema = z.object({
  nombreObra: z
    .string()
    .trim()
    .min(1, "El nombre de la obra es obligatorio.")
    .max(150, "El nombre no puede superar los 150 caracteres."),
  pais: z.string().trim().min(1, "El país es obligatorio."),
  provincia: z.string().trim().min(1, "La provincia es obligatoria."),
  localidad: z.string().trim().min(1, "La localidad es obligatoria."),
});

export const bajaObraSchema = z.object({
  motivoCambio: z
    .string()
    .trim()
    .min(1, "Debe ingresar un motivo para dar de baja / suspender la obra."),
});

export const transicionarEstadoObraSchema = z.object({
  idEstadoObra: z.number().min(1, "Debe seleccionar un estado destino."),
  motivoCambio: z
    .string()
    .trim()
    .min(1, "Debe indicar el motivo del cambio de estado."),
});

export type CreateObraForm = z.infer<typeof createObraSchema>;
export type ModifyObraForm = z.infer<typeof modifyObraSchema>;
export type BajaObraForm = z.infer<typeof bajaObraSchema>;
export type TransicionarEstadoObraForm = z.infer<
  typeof transicionarEstadoObraSchema
>;
