import type { RolNombre } from "@/features/auth/types/auth.types";

export type TipoNotificacion =
  | "SOLICITUD_AUSENCIA_NUEVA"
  | "SOLICITUD_AUSENCIA_RESUELTA"
  | "ASISTENCIA_MARCADA"
  | "ASISTENCIA_REGISTRADA_MANUAL"
  | "ASISTENCIA_ANULADA"
  | "ASISTENCIA_REGULARIZADA"
  | "PLAN_TRABAJO_ACTUALIZADO"
  | "JORNADA_MODIFICADA"
  | "CUADRILLA_ASIGNADA"
  | "CUADRILLA_DESASIGNADA"
  | "LIDER_CUADRILLA_ASIGNADO"
  | "CAPATAZ_ASIGNADO"
  | "OBRA_ESTADO_CAMBIADO"
  | "GRUPO_ASIGNADO"
  | "CATEGORIA_ASIGNADA"
  | "LEGAJO_ACTUALIZADO"
  | "EPP_ENTREGADO"
  | "RECIBO_DISPONIBLE"
  | "DOCUMENTO_CARGADO"
  | "PRE_LIQUIDACION_FINALIZADA"
  | "BIENVENIDA"
  | "SEGURIDAD_CUENTA"
  | "AVISO_GLOBAL";

export type CategoriaNotificacion =
  | "AUSENCIAS"
  | "ASISTENCIA"
  | "JORNADAS"
  | "OBRAS_CUADRILLAS"
  | "LEGAJO"
  | "LIQUIDACION"
  | "CUENTA"
  | "SISTEMA";

export interface NotificacionDto {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  link: string | null;
  leida: boolean;
  fechaAlta: string;
}

export interface CantidadNoLeidasDto {
  cantidad: number;
}

export interface ConfiguracionNotificacionDto {
  tipo: TipoNotificacion;
  nombre: string;
  descripcion: string;
  categoria: CategoriaNotificacion;
  categoriaNombre: string;
  habilitada: boolean;
}

export interface AvisoGlobalRequestDto {
  titulo: string;
  mensaje: string;
  link: string | null;
  roles: RolNombre[];
}

export interface AvisoGlobalResponseDto {
  destinatarios: number;
}
