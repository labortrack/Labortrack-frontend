import type { SpringPage } from "@/shared/types/pagination.types";

export type { SpringPage };

// ─── Tipos de Documento ───────────────────────────────────────────────────────

export interface TipoDocumentoDTO {
  idTipoDocumento: number;
  nombre: string;
  descripcion: string;
  procesarEnRag: boolean;
  categoriaRuteo: string;
  visibilidadDefecto: string;
}

/** DTO enviado al backend para crear o modificar un Tipo de Documento. */
export interface TipoDocumentoModificacionDto {
  nombre: string;
  descripcion: string;
  procesarEnRag: boolean;
  categoriaRuteo: string;
  visibilidadDefecto: string;
}

// ─── Documentos ───────────────────────────────────────────────────────────────

export interface DocumentoRespuestaDto {
  idDocumento: number;
  nombreDocumento: string;
  nombreArchivoOriginal: string;
  pathMinio: string;
  hashSha256: string;
  /** ISO-8601 timestamp devuelto por el backend. */
  fechaSubida: string;
  contentType: string;
  visibilidad: string;
  esIndexadoRag: boolean;
  tipoDocumentoNombre: string;
  usuarioSubidaId: number;
  /** Presente únicamente cuando el documento está asociado a un empleado. */
  empleadoId: number | null;
}

// ─── Filtros de listado ───────────────────────────────────────────────────────

export interface DocumentoFilterDto {
  nombreDocumento?: string;
  tipoDocumentoId?: number;
  empleadoId?: number;
  visibilidad?: string;
  esIndexadoRag?: boolean;
}
