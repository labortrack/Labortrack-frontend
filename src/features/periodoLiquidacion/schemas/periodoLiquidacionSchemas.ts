import { z } from "zod";
import {
  calcularFechaHasta,
  formatFecha,
  primerDiaEjecucion,
} from "../utils/periodoLiquidacion";

// Espejo de PeriodoLiquidacionDtoRequest y de las reglas de PeriodoLiquidacionServiceImpl
// (RF048). El tope superior de la fecha de ejecución depende de una configuración del
// backend, así que esa validación queda de su lado.
export const periodoLiquidacionSchema = z
  .object({
    descripcionPeriodoLiquidacion: z
      .string()
      .trim()
      .min(1, "La descripción del período es obligatoria.")
      .max(255, "La descripción no puede superar los 255 caracteres."),
    tipoPeriodo: z.enum(["QUINCENAL", "MENSUAL"], {
      error: "Seleccioná el tipo de período.",
    }),
    fechaDesde: z.string().min(1, "La fecha de inicio es obligatoria."),
    /** yyyy-MM-dd, o vacío para que el backend la programe. */
    fechaEjecucionPreLiquidacion: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.fechaDesde) return;

    const fechaHasta = calcularFechaHasta(values.fechaDesde, values.tipoPeriodo);
    if (!fechaHasta) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaDesde"],
        message:
          values.tipoPeriodo === "MENSUAL"
            ? "Un período mensual debe empezar el día 1 del mes."
            : "Un período quincenal debe empezar el día 1 o el día 16 del mes.",
      });
      return;
    }

    const primerDia = primerDiaEjecucion(fechaHasta);
    if (
      values.fechaEjecucionPreLiquidacion &&
      values.fechaEjecucionPreLiquidacion < primerDia
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["fechaEjecucionPreLiquidacion"],
        message: `La pre-liquidación no puede ejecutarse antes del cierre del período. El primer día válido es el ${formatFecha(primerDia)}.`,
      });
    }
  });

export type PeriodoLiquidacionFormValues = z.infer<
  typeof periodoLiquidacionSchema
>;
