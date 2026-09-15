import { z } from "zod";

export const regularizacionAsistenciaSchema = z
  .object({
    horaIngreso: z.string().min(1, "La hora real de ingreso es obligatoria."),
    horaEgreso: z.string().min(1, "La hora real de egreso es obligatoria."),
    motivo: z
      .string()
      .trim()
      .min(1, "El motivo de regularización es obligatorio.")
      .max(500, "El motivo no puede superar los 500 caracteres."),
  })
  .superRefine(({ horaIngreso, horaEgreso }, context) => {
    if (horaIngreso && horaEgreso && horaEgreso <= horaIngreso) {
      context.addIssue({
        code: "custom",
        path: ["horaEgreso"],
        message:
          "La hora real de egreso debe ser posterior a la hora real de ingreso.",
      });
    }
  });

export type RegularizacionAsistenciaForm = z.infer<
  typeof regularizacionAsistenciaSchema
>;
