import type {
  DecisionDiaNoLaborable,
  DiaSemana,
  EstadoCalculadoPlanTrabajo,
  EstadoJornadaTrabajo,
  TipoJornada,
} from "../types/planTrabajo.types";

const dayLabels: Record<DiaSemana, string> = {
  LUNES: "Lun",
  MARTES: "Mar",
  MIERCOLES: "Mié",
  JUEVES: "Jue",
  VIERNES: "Vie",
  SABADO: "Sáb",
  DOMINGO: "Dom",
};

const dayOrder: DiaSemana[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
];

export function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateTime(value: string) {
  const [date, time = ""] = value.split("T");
  return `${formatDate(date)} ${time.slice(0, 5)}`.trim();
}

export function formatTime(value: string) {
  return value.slice(0, 5);
}

export function formatDays(days: DiaSemana[]) {
  return [...days]
    .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
    .map((day) => dayLabels[day])
    .join(", ");
}

export const estadoPlanLabels: Record<EstadoCalculadoPlanTrabajo, string> = {
  PROGRAMADO: "Programado",
  VIGENTE: "Vigente",
  FINALIZADO: "Finalizado",
};

export const tipoJornadaLabels: Record<TipoJornada, string> = {
  HABIL: "Hábil",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
  FERIADO: "Feriado",
  NO_LABORABLE: "No laborable",
};

export const estadoJornadaLabels: Record<EstadoJornadaTrabajo, string> = {
  PROGRAMADA: "Programada",
  NO_TRABAJADA: "No trabajada",
  EN_CURSO: "En curso",
  FINALIZADA: "Finalizada",
  ANULADA: "Anulada",
};

export const decisionLabels: Record<DecisionDiaNoLaborable, string> = {
  NO_APLICA: "No aplica",
  SE_TRABAJA: "Se trabaja",
  NO_SE_TRABAJA: "No se trabaja",
};
