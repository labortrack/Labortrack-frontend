import { z } from "zod";

export const altaEppSchema = z.object({
  nombreEPP: z
    .string()
    .trim()
    .min(1, "El nombre del EPP es obligatorio.")
    .max(150, "El nombre no puede superar los 150 caracteres."),
  stockEPP: z
    .number({ error: "El stock es obligatorio." })
    .int("El stock debe ser un número entero.")
    .positive("El stock debe ser un número entero positivo."),
});

export const modificarEppSchema = z.object({
  nombreEPP: z
    .string()
    .trim()
    .min(1, "El nombre del EPP es obligatorio.")
    .max(150, "El nombre no puede superar los 150 caracteres."),
});

export const reponerEppSchema = z.object({
  cantidadReponer: z
    .number({ error: "La cantidad a reponer es obligatoria." })
    .int("La cantidad a reponer debe ser un número entero.")
    .positive("La cantidad a reponer debe ser un número entero positivo."),
});

export const nuevaEntregaSchema = z.object({
  empleadoId: z
    .number({ error: "Debe seleccionar un empleado." })
    .int("El ID de empleado debe ser un entero.")
    .positive("Debe seleccionar un empleado válido."),
  eppId: z
    .number({ error: "Debe seleccionar un EPP." })
    .int("El ID de EPP debe ser un entero.")
    .positive("Debe seleccionar un EPP válido."),
  cantidadEntregada: z
    .number({ error: "La cantidad entregada es obligatoria." })
    .int("La cantidad debe ser un número entero.")
    .positive("La cantidad entregada debe ser un número entero positivo."),
  fechaEntrega: z
    .string()
    .trim()
    .min(1, "La fecha de entrega es obligatoria."),
});

export type AltaEppForm = z.infer<typeof altaEppSchema>;
export type ModificarEppForm = z.infer<typeof modificarEppSchema>;
export type ReponerEppForm = z.infer<typeof reponerEppSchema>;
export type NuevaEntregaForm = z.infer<typeof nuevaEntregaSchema>;
