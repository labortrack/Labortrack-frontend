export type OperacionAuditoria = 'CREACION' | 'MODIFICACION' | 'ELIMINACION';

export interface CambioCampoDTO {
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
}

export interface AuditoriaLogDTO {
  revision: number;
  fecha: string; // ISO 8601 string
  operacion: OperacionAuditoria;
  usuario: string;
  rol: string;
  entidad: string;
  entidadId: number;
  cambios: CambioCampoDTO[];
}

export interface AuditoriaFeedItem {
  revision: number;
  fecha: string; // ISO-8601 UTC
  operacion: OperacionAuditoria;
  usuario: string;
  rol: string;
  entidad: string;
  entidadNombre: string; // "Solicitud de ausencia"
  entidadId: number;
  etiqueta: string;
}

export interface AuditoriaFeedPage {
  items: AuditoriaFeedItem[];
  page: number;
  size: number;
  hayMas: boolean;
}

export interface AuditoriaFeedFiltros {
  page?: number;
  size?: number;
  usuario?: string;
  desde?: string; // ISO-8601 UTC
  hasta?: string; // ISO-8601 UTC
  operacion?: OperacionAuditoria;
}

/** Página del feed de todas las entidades (GET /api/auditoria/cambios). */
export interface AuditoriaCambiosPage {
  items: AuditoriaFeedItem[];
  size: number;
  siguienteCursor: string | null; // "revision:entidad:id"; null si no hay más
}

export interface AuditoriaCambiosFiltros {
  antesDe?: string | null;
  size?: number;
  usuario?: string;
  desde?: string; // ISO-8601 UTC
  hasta?: string; // ISO-8601 UTC
  operacion?: OperacionAuditoria;
  /** true quita las exclusiones por defecto del backend (ruido operativo y SISTEMA). */
  incluirRuido?: boolean;
}
