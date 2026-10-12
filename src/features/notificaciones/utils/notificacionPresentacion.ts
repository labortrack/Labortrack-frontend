import {
  CalendarCheck,
  CalendarPlus,
  HardHat,
  Megaphone,
  Receipt,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { TipoNotificacion } from "../types/notificaciones.types";

export const iconoPorTipo: Record<TipoNotificacion, LucideIcon> = {
  SOLICITUD_AUSENCIA_NUEVA: CalendarPlus,
  SOLICITUD_AUSENCIA_RESUELTA: CalendarCheck,
  RECIBO_DISPONIBLE: Receipt,
  EPP_ENTREGADO: HardHat,
  CUADRILLA_ASIGNADA: UsersRound,
  AVISO_GLOBAL: Megaphone,
};

const relativo = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });
const absoluto = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

/** "hace 5 minutos", "ayer"… hasta una semana; después la fecha completa. */
export function formatFechaNotificacion(fechaIso: string, ahora = new Date()) {
  const fecha = new Date(fechaIso);
  const segundos = Math.round((fecha.getTime() - ahora.getTime()) / 1000);
  const abs = Math.abs(segundos);

  if (abs < 60) return "recién";
  if (abs < 3600) return relativo.format(Math.round(segundos / 60), "minute");
  if (abs < 86_400) return relativo.format(Math.round(segundos / 3600), "hour");
  if (abs < 604_800) return relativo.format(Math.round(segundos / 86_400), "day");
  return absoluto.format(fecha);
}
