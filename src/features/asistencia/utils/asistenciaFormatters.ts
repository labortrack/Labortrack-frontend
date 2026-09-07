import type {
  EstadoAsistencia,
  ObraAsistenciaResponseDto,
  TipoAsistencia,
  TipoJornada,
  EstadoJornadaTrabajo,
} from "../types/asistencia.types";

export const ESTADO_ASISTENCIA_LABELS = {
  PENDIENTE_INGRESO: "Pendiente de ingreso",
  PRESENTE: "Presente / Asistencia abierta",
  EGRESADO: "Egresado / Asistencia cerrada",
  AUSENTE: "Ausente",
  AUSENCIA_JUSTIFICADA: "Ausencia justificada",
  NO_TRABAJADA_COMPUTABLE: "No trabajada computable",
  ANULADA: "Anulada",
} satisfies Record<EstadoAsistencia, string>;

export const TIPO_ASISTENCIA_LABELS = {
  QR: "QR",
  REGISTRO_MANUAL: "Registro manual",
} satisfies Record<TipoAsistencia, string>;

export const TIPO_JORNADA_LABELS = {
  HABIL: "Hábil",
  SABADO: "Sábado",
  DOMINGO: "Domingo",
  FERIADO: "Feriado",
  NO_LABORABLE: "No laborable",
} satisfies Record<TipoJornada, string>;

export const ESTADO_JORNADA_LABELS = {
  PROGRAMADA: "Programada",
  NO_TRABAJADA: "No trabajada",
  EN_CURSO: "En curso",
  FINALIZADA: "Finalizada",
  ANULADA: "Anulada",
} satisfies Record<EstadoJornadaTrabajo, string>;

export function formatUbicacionObra(obra: ObraAsistenciaResponseDto) {
  return [obra.localidad, obra.provincia, obra.pais]
    .filter(Boolean)
    .join(", ");
}

export function formatFecha(fecha: string | null | undefined) {
  if (!fecha) return "—";

  const [anio, mes, dia] = fecha.split("-");
  if (!anio || !mes || !dia) return fecha;

  return `${dia}/${mes}/${anio}`;
}

export function formatHora(fechaHora: string | null | undefined) {
  if (!fechaHora) return "—";

  const hora = fechaHora.includes("T")
    ? fechaHora.split("T")[1]
    : fechaHora;

  return hora?.slice(0, 5) || fechaHora;
}

export function formatFechaHora(fechaHora: string | null | undefined) {
  if (!fechaHora) return "—";

  const [fecha] = fechaHora.split("T");
  return `${formatFecha(fecha)} ${formatHora(fechaHora)}`;
}
