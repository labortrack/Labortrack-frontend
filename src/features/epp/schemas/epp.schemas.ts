import { z } from "zod";
import { fechaLocalActual } from "@/shared/utils/fechaLocal";
import { MAX_ITEMS_REMITO } from "../utils/remito";

export const altaEppSchema = z.object({
  nombreEPP: z
    .string()
    .trim()
    .min(3, "El nombre del EPP debe tener entre 3 y 100 caracteres.")
    .max(100, "El nombre del EPP debe tener entre 3 y 100 caracteres."),
  stockEPP: z
    .number({ error: "El stock es obligatorio." })
    .int("El stock debe ser un número entero.")
    .positive("El stock debe ser un número entero positivo."),
});

export const modificarEppSchema = z.object({
  nombreEPP: z
    .string()
    .trim()
    .min(3, "El nombre del EPP debe tener entre 3 y 100 caracteres.")
    .max(100, "El nombre del EPP debe tener entre 3 y 100 caracteres."),
});

export const reponerEppSchema = z.object({
  cantidadReponer: z
    .number({ error: "La cantidad a reponer es obligatoria." })
    .int("La cantidad a reponer debe ser un número entero.")
    .positive("La cantidad a reponer debe ser un número entero positivo."),
});

const itemRemitoSchema = z.object({
  eppId: z
    .number({ error: "Debe seleccionar un EPP." })
    .int("El ID de EPP debe ser un entero.")
    .positive("Debe seleccionar un EPP."),
  cantidad: z
    .number({ error: "La cantidad es obligatoria." })
    .int("La cantidad debe ser un número entero.")
    .positive("La cantidad debe ser un número entero positivo."),
});

export const nuevoRemitoSchema = z.object({
  empleadoId: z
    .number({ error: "Debe seleccionar un empleado." })
    .int("El ID de empleado debe ser un entero.")
    .positive("Debe seleccionar un empleado válido."),
  fechaEntrega: z
    .string()
    .trim()
    .min(1, "La fecha de entrega es obligatoria.")
    .refine(
      (fecha) => fecha <= fechaLocalActual(),
      "La fecha de entrega no puede ser una fecha futura.",
    ),
  items: z
    .array(itemRemitoSchema)
    .min(1, "El remito debe tener al menos un EPP.")
    .max(
      MAX_ITEMS_REMITO,
      `Un remito admite como máximo ${MAX_ITEMS_REMITO} EPP distintos.`,
    )
    .superRefine((items, ctx) => {
      const vistos = new Set<number>();
      items.forEach((item, index) => {
        if (item.eppId <= 0) return;
        if (vistos.has(item.eppId)) {
          ctx.addIssue({
            code: "custom",
            message: "Este EPP ya está en otra fila.",
            path: [index, "eppId"],
          });
        }
        vistos.add(item.eppId);
      });
    }),
});

export type AltaEppForm = z.infer<typeof altaEppSchema>;
export type ModificarEppForm = z.infer<typeof modificarEppSchema>;
export type ReponerEppForm = z.infer<typeof reponerEppSchema>;
export type NuevoRemitoForm = z.infer<typeof nuevoRemitoSchema>;
