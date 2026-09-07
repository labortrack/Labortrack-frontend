import type { SpringPage } from "@/shared/types/pagination.types";

export type { SpringPage };

// ─── Enums de Tipos de Documento ─────────────────────────────────────────────

export type CategoriaRuteo =
  | "LEGAJO_PERSONAL"
  | "RECIBOS_SUELDOS"
  | "HIGIENE_Y_SEGURIDAD"
  | "INSTITUCIONAL"
  | "AUSENTISMO";

export type Visibilidad = "PUBLICO" | "RRHH" | "EMPLEADO";

export const CATEGORIA_RUTEO_LABELS: Record<CategoriaRuteo, string> = {
  LEGAJO_PERSONAL: "Legajo Personal",
  RECIBOS_SUELDOS: "Recibos de Sueldos",
  HIGIENE_Y_SEGURIDAD: "Higiene y Seguridad",
  INSTITUCIONAL: "Institucional",
  AUSENTISMO: "Ausentismo",
};

export const VISIBILIDAD_LABELS: Record<Visibilidad, { label: string; desc: string }> = {
  PUBLICO: {
    label: "Público",
    desc: "Accesible por cualquier usuario autenticado de la plataforma",
  },
  RRHH: {
    label: "RRHH",
    desc: "Accesible solo por perfiles administrativos, RRHH e Higiene y Seguridad",
  },
  EMPLEADO: {
    label: "Empleado",
    desc: "Accesible únicamente por el dueño del legajo y perfiles RRHH/Admin",
  },
};

// ─── Tipos de Documento DTOs ──────────────────────────────────────────────────

export interface TipoDocumentoDTO {
  idTipoDocumento?: number;
  id?: number;
  nombre: string;
  descripcion: string;
  procesarEnRag: boolean;
  categoriaRuteo: CategoriaRuteo | string;
  visibilidadDefecto: Visibilidad | string;
  activo?: boolean;
  fechaBaja?: string | null;
}


/** DTO enviado al backend para modificar un Tipo de Documento (PUT). */
export interface TipoDocumentoModificacionDto {
  nombre: string;
  descripcion: string;
  procesarEnRag: boolean;
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
  /** URL prefirmada devuelta por el endpoint de visualización */
  url?: string;
}

export interface DocumentoVisualizacionResponseDto {
  url: string;
  nombreArchivo?: string;
  contentType?: string;
}


// ─── Filtros de listado ───────────────────────────────────────────────────────

export interface DocumentoFilterDto {
  nombreDocumento?: string;
  tipoDocumentoId?: number;
  empleadoId?: number;
  visibilidad?: string;
  esIndexadoRag?: boolean;
}
