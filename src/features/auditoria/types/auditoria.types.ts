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
