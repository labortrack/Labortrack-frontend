import { z } from "zod";

export const categoriaZonaSchema = z.object({
  idZona: z
    .number({ error: "Seleccioná una zona." })
    .int()
    .positive("Seleccioná una zona."),
  idCategoriaUOCRA: z
    .number({ error: "Seleccioná una categoría." })
    .int()
    .positive("Seleccioná una categoría."),
  valorHoraAdicional: z
    .number({ error: "El valor hora adicional es obligatorio." })
    .positive("El valor hora adicional debe ser mayor a 0."),
  sumaNoRemunerativa: z
    .number({ error: "La suma no remunerativa es obligatoria." })
    .min(0, "La suma no remunerativa no puede ser negativa."),
});

export type CategoriaZonaFormValues = z.infer<typeof categoriaZonaSchema>;
