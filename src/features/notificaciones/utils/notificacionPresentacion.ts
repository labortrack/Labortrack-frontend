import {
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  ClipboardCheck,
  ClipboardList,
  ClipboardX,
  Crown,
  FileText,
  HardHat,
  KeyRound,
  Megaphone,
  PartyPopper,
  Receipt,
  Shapes,
  Tag,
  UserCog,
  UserMinus,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { TipoNotificacion } from "../types/notificaciones.types";

export const iconoPorTipo: Record<TipoNotificacion, LucideIcon> = {
  SOLICITUD_AUSENCIA_NUEVA: CalendarPlus,
  SOLICITUD_AUSENCIA_RESUELTA: CalendarCheck,
  ASISTENCIA_MARCADA: ClipboardCheck,
  ASISTENCIA_REGISTRADA_MANUAL: ClipboardList,
  ASISTENCIA_ANULADA: ClipboardX,
  ASISTENCIA_REGULARIZADA: ClipboardCheck,
  PLAN_TRABAJO_ACTUALIZADO: CalendarClock,
  JORNADA_MODIFICADA: CalendarClock,
  CUADRILLA_ASIGNADA: UsersRound,
  CUADRILLA_DESASIGNADA: UserMinus,
  LIDER_CUADRILLA_ASIGNADO: Crown,
  CAPATAZ_ASIGNADO: HardHat,
  OBRA_ESTADO_CAMBIADO: Building2,
  GRUPO_ASIGNADO: Shapes,
  CATEGORIA_ASIGNADA: Tag,
  LEGAJO_ACTUALIZADO: UserCog,
  EPP_ENTREGADO: HardHat,
  RECIBO_DISPONIBLE: Receipt,
  DOCUMENTO_CARGADO: FileText,
  BIENVENIDA: PartyPopper,
  SEGURIDAD_CUENTA: KeyRound,
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
