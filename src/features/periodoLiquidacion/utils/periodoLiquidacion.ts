import type {
  EstadoPeriodoLiquidacion,
  PeriodoLiquidacionResponseDto,
  TipoPeriodo,
} from "../types/periodoLiquidacion.types";

export const TIPO_PERIODO_LABELS: Record<TipoPeriodo, string> = {
  QUINCENAL: "Quincenal",
  MENSUAL: "Mensual",
};

export const TIPO_PERIODO_OPTIONS = Object.entries(TIPO_PERIODO_LABELS).map(
  ([value, label]) => ({ value: value as TipoPeriodo, label }),
);

export const ESTADO_PERIODO_LABELS: Record<EstadoPeriodoLiquidacion, string> = {
  PENDIENTE: "Pendiente",
  PRE_LIQUIDADO: "Pre-liquidado",
  CERRADO: "Cerrado",
};

/**
 * El cron de pre-liquidación corre una vez por día a esta hora
 * (labortrack.liquidacion.preliquidacion.cron en el backend), así que solo se pide el
 * día de ejecución y se envía con esta hora, la misma que el backend usa por defecto.
 */
export const HORA_EJECUCION_PRE_LIQUIDACION = "03:00";

/** El backend solo permite modificar o dar de baja períodos en estado PENDIENTE. */
export function esPeriodoEditable(periodo: PeriodoLiquidacionResponseDto) {
  return periodo.estadoPeriodoLiquidacion === "PENDIENTE";
}

// ─── Calendario ─────────────────────────────────────────────────────────────
// Espejo de PeriodoLiquidacionServiceImpl: los períodos se anclan al calendario.
// Una quincena va del 1 al 15 o del 16 al último día del mes; un mes, del 1 al último.
// Las fechas viajan como texto yyyy-MM-dd y se operan en UTC para no correrse de día.

const DIA_FIN_PRIMERA_QUINCENA = 15;
const DIA_INICIO_SEGUNDA_QUINCENA = 16;

function parsearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!anio || !mes || !dia) return null;
  return { anio, mes, dia };
}

function aTexto(fecha: Date) {
  return fecha.toISOString().slice(0, 10);
}

export function diaInicioValido(fechaDesde: string, tipo: TipoPeriodo) {
  const partes = parsearFecha(fechaDesde);
  if (!partes) return false;
  return tipo === "MENSUAL"
    ? partes.dia === 1
    : partes.dia === 1 || partes.dia === DIA_INICIO_SEGUNDA_QUINCENA;
}

/** Devuelve null si la fecha de inicio no corresponde al tipo de período. */
export function calcularFechaHasta(
  fechaDesde: string,
  tipo: TipoPeriodo,
): string | null {
  if (!diaInicioValido(fechaDesde, tipo)) return null;
  const { anio, mes, dia } = parsearFecha(fechaDesde)!;
  const ultimoDiaDelMes = new Date(Date.UTC(anio, mes, 0));
  if (tipo === "QUINCENAL" && dia === 1) {
    return aTexto(new Date(Date.UTC(anio, mes - 1, DIA_FIN_PRIMERA_QUINCENA)));
  }
  return aTexto(ultimoDiaDelMes);
}

/** La pre-liquidación no puede correr antes de que el período esté cerrado. */
export function primerDiaEjecucion(fechaHasta: string) {
  const { anio, mes, dia } = parsearFecha(fechaHasta)!;
  return aTexto(new Date(Date.UTC(anio, mes - 1, dia + 1)));
}

// ─── Formato ────────────────────────────────────────────────────────────────

export function formatFecha(fecha: string | null | undefined) {
  if (!fecha) return "—";
  const partes = parsearFecha(fecha.slice(0, 10));
  if (!partes) return fecha;
  const dd = String(partes.dia).padStart(2, "0");
  const mm = String(partes.mes).padStart(2, "0");
  return `${dd}/${mm}/${partes.anio}`;
}

export function formatFechaHora(fechaHora: string | null | undefined) {
  if (!fechaHora) return "—";
  return `${formatFecha(fechaHora)} ${fechaHora.slice(11, 16)}`;
}
