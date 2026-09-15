import { z } from "zod";

export const tipoSolicitudAusenciaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio."),
  descripcion: z.string().trim().min(1, "La descripción es obligatoria."),
  maxDias: z.string().trim().min(1, "La cantidad máxima de días es obligatoria.")
    .refine((valor) => Number.isInteger(Number(valor)) && Number(valor) > 0 && Number(valor) <= 2_147_483_647,
      "La cantidad máxima de días debe ser un entero mayor a cero."),
  permiteRetroactiva: z.boolean(),
  requiereDocumento: z.boolean(),
});

export type TipoSolicitudAusenciaForm = z.infer<typeof tipoSolicitudAusenciaSchema>;
