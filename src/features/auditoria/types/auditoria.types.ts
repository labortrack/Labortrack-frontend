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
