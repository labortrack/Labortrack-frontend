import type { RolNombre } from "@/features/auth/types/auth.types";

export type TipoNotificacion =
  | "SOLICITUD_AUSENCIA_NUEVA"
  | "SOLICITUD_AUSENCIA_RESUELTA"
  | "RECIBO_DISPONIBLE"
  | "EPP_ENTREGADO"
  | "CUADRILLA_ASIGNADA"
  | "AVISO_GLOBAL";

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
