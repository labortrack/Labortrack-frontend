import { z } from "zod";
import type { DiaSemana } from "../types/planTrabajo.types";

const diasSemana: DiaSemana[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

const diaPorIndice: DiaSemana[] = [
  "DOMINGO",
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
];

export function fechaLocalActual(fecha = new Date()) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sumarDiasFechaLocal(value: string, cantidad: number) {
  const fecha = fechaLocal(value);
  fecha.setDate(fecha.getDate() + cantidad);
  return fechaLocalActual(fecha);
}

function fechaLocal(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function periodoContieneDia(
  desde: string,
  hasta: string,
  dias: DiaSemana[],
) {
  const cursor = fechaLocal(desde);
  const limite = fechaLocal(hasta);
  while (cursor <= limite) {
    if (dias.includes(diaPorIndice[cursor.getDay()])) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

const planBaseSchema = z.object({
  fechaVigenciaDesde: z.string().min(1, "La fecha desde es obligatoria."),
  fechaVigenciaHasta: z.string().min(1, "La fecha hasta es obligatoria."),
  horaInicioPlanificada: z.string().min(1, "La hora de inicio es obligatoria."),
  horaFinPlanificada: z.string().min(1, "La hora de fin es obligatoria."),
  dias: z.array(z.enum(diasSemana)).min(1, "Seleccioná al menos un día de trabajo."),
});

export function crearPlanTrabajoSchema({
  modo,
  fechaDesdeOriginal,
  hoy = fechaLocalActual(),
}: {
  modo: "crear" | "modificar-programado" | "modificar-vigente";
  fechaDesdeOriginal?: string;
  hoy?: string;
}) {
  return planBaseSchema.superRefine((values, context) => {
    const inicioValidacionDias =
      modo === "modificar-vigente"
        ? sumarDiasFechaLocal(hoy, 1)
        : values.fechaVigenciaDesde;
    if (
      values.fechaVigenciaDesde &&
      modo !== "modificar-vigente" &&
      values.fechaVigenciaDesde <= hoy
    ) {
      context.addIssue({
        code: "custom",
        path: ["fechaVigenciaDesde"],
        message: "La fecha desde debe ser posterior a la fecha actual.",
      });
    }
    if (
      modo === "modificar-vigente" &&
      fechaDesdeOriginal &&
      values.fechaVigenciaDesde !== fechaDesdeOriginal
    ) {
      context.addIssue({
        code: "custom",
        path: ["fechaVigenciaDesde"],
        message: "La fecha desde de un plan vigente no puede modificarse.",
      });
    }
    if (
      values.fechaVigenciaDesde &&
      values.fechaVigenciaHasta &&
      values.fechaVigenciaHasta <= values.fechaVigenciaDesde
    ) {
      context.addIssue({
        code: "custom",
        path: ["fechaVigenciaHasta"],
        message: "La fecha hasta debe ser posterior a la fecha desde.",
      });
    } else if (
      modo === "modificar-vigente" &&
      values.fechaVigenciaHasta &&
      values.fechaVigenciaHasta <= hoy
    ) {
      context.addIssue({
        code: "custom",
        path: ["fechaVigenciaHasta"],
        message: "La fecha hasta debe ser posterior a la fecha actual.",
      });
    }
    if (
      values.horaInicioPlanificada &&
      values.horaFinPlanificada &&
      values.horaFinPlanificada <= values.horaInicioPlanificada
    ) {
      context.addIssue({
        code: "custom",
        path: ["horaFinPlanificada"],
        message: "La hora de fin debe ser posterior a la hora de inicio.",
      });
    }
    if (
      values.fechaVigenciaDesde &&
      values.fechaVigenciaHasta &&
      values.fechaVigenciaHasta > values.fechaVigenciaDesde &&
      values.dias.length > 0 &&
      inicioValidacionDias <= values.fechaVigenciaHasta &&
      !periodoContieneDia(inicioValidacionDias, values.fechaVigenciaHasta, values.dias)
    ) {
      context.addIssue({
        code: "custom",
        path: ["dias"],
        message:
          modo === "modificar-vigente"
            ? "Los días seleccionados no coinciden con ninguna fecha futura del período."
            : "Los días seleccionados no coinciden con ninguna fecha del período.",
      });
    }
  });
}

export type PlanTrabajoFormValues = z.infer<typeof planBaseSchema>;

const jornadaExtraordinariaBaseSchema = z.object({
  fecha: z.string().min(1, "La fecha de la jornada es obligatoria."),
  horaInicioPlanificada: z.string().min(1, "La hora de inicio es obligatoria."),
  horaFinPlanificada: z.string().min(1, "La hora de fin es obligatoria."),
});

export function crearJornadaExtraordinariaSchema({
  fechaVigenciaDesde,
  fechaVigenciaHasta,
  ahora = new Date(),
}: {
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  ahora?: Date;
}) {
  const hoy = fechaLocalActual(ahora);
  const horaActual = `${String(ahora.getHours()).padStart(2, "0")}:${String(
    ahora.getMinutes(),
  ).padStart(2, "0")}`;
  return jornadaExtraordinariaBaseSchema.superRefine((values, context) => {
    if (values.fecha && values.fecha < hoy) {
      context.addIssue({
        code: "custom",
        path: ["fecha"],
        message: "La fecha no puede ser anterior a la fecha actual.",
      });
    } else if (
      values.fecha &&
      (values.fecha < fechaVigenciaDesde || values.fecha > fechaVigenciaHasta)
    ) {
      context.addIssue({
        code: "custom",
        path: ["fecha"],
        message: "La fecha debe encontrarse dentro de la vigencia del plan.",
      });
    }
    if (
      values.horaInicioPlanificada &&
      values.horaFinPlanificada &&
      values.horaFinPlanificada <= values.horaInicioPlanificada
    ) {
      context.addIssue({
        code: "custom",
        path: ["horaFinPlanificada"],
        message: "La hora de fin debe ser posterior a la hora de inicio.",
      });
    }
    if (
      values.fecha === hoy &&
      values.horaInicioPlanificada &&
      values.horaInicioPlanificada <= horaActual
    ) {
      context.addIssue({
        code: "custom",
        path: ["horaInicioPlanificada"],
        message: "Para una jornada de hoy, el horario debe ser posterior a la hora actual.",
      });
    }
    if (
      values.fecha === hoy &&
      values.horaFinPlanificada &&
      values.horaFinPlanificada <= horaActual
    ) {
      context.addIssue({
        code: "custom",
        path: ["horaFinPlanificada"],
        message: "Para una jornada de hoy, el horario debe ser posterior a la hora actual.",
      });
    }
  });
}

export type JornadaExtraordinariaFormValues = z.infer<
  typeof jornadaExtraordinariaBaseSchema
>;
