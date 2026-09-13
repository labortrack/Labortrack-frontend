import type { EstadoSolicitudAusencia } from "../types/solicitudAusencia.types";

export const ESTADOS_SOLICITUD_AUSENCIA: Record<EstadoSolicitudAusencia, string> = {
  EN_REVISION: "En revisión",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  REVOCADA: "Revocada",
};
export function fechaLocalHoy() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}
export function esFechaValida(fecha: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const parsed = new Date(fecha + "T00:00:00Z");
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === fecha;
}
export function cantidadDiasAusencia(desde: string, hasta: string) {
  if (!esFechaValida(desde) || !esFechaValida(hasta) || hasta < desde) return 0;
  return Math.round((Date.parse(hasta + "T00:00:00Z") - Date.parse(desde + "T00:00:00Z")) / 86_400_000) + 1;
}
