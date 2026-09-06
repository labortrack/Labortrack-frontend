import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  TipoDocumentoDTO,
  TipoDocumentoModificacionDto,
  DocumentoRespuestaDto,
  DocumentoFilterDto,
} from "../types/documentacion.types";
import type {
  PageableParams,
  SpringPage,
} from "@/shared/types/pagination.types";

// ─── Base URLs ────────────────────────────────────────────────────────────────

const TIPOS_BASE = "/api/v1/tipos-documento";
const DOCS_BASE = "/api/v1/documentos";
const LEGAJOS_BASE = "/legajos";

// ─── Tipos locales ────────────────────────────────────────────────────────────

/** Subconjunto de EmpleadoResumenResponseDto que necesitamos en el combobox. */
export interface EmpleadoResumenDto {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  estadoActual: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normaliza los filtros para coincidir con los RequestParam del backend Spring. */
function mapDocumentoFilters(filter: DocumentoFilterDto) {
  const params: Record<string, unknown> = {};
  if (filter.nombreDocumento?.trim()) {
    params.buscarPorNombre = filter.nombreDocumento.trim();
  }
  if (filter.tipoDocumentoId) {
    params.tipoDocumentoId = filter.tipoDocumentoId;
  }
  if (filter.empleadoId) {
    params.empleadoId = filter.empleadoId;
  }
  if (filter.visibilidad) {
    params.visibilidad = filter.visibilidad;
  }
  return params;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const documentacionApi = {
  // ── Tipos de Documento ────────────────────────────────────────────────────

  /** Crea un nuevo Tipo de Documento. */
  crearTipoDocumento: async (payload: TipoDocumentoModificacionDto) =>
    (
      await httpClient.post<TipoDocumentoDTO>(
        `${TIPOS_BASE}/crear`,
        payload,
      )
    ).data,

  /** Modifica un Tipo de Documento existente por su ID. */
  modificarTipoDocumento: async (
    id: number,
    payload: TipoDocumentoModificacionDto,
  ) =>
    (
      await httpClient.put<TipoDocumentoDTO>(
        `${TIPOS_BASE}/modificar/${id}`,
        payload,
      )
    ).data,

  /** Da de baja (desactiva) un Tipo de Documento por su ID. */
  bajaTipoDocumento: async (id: number) =>
    (
      await httpClient.delete<void>(`${TIPOS_BASE}/BajaTipoDocumento/${id}`)
    ).data,

  /** Reactiva un Tipo de Documento previamente dado de baja. */
  reactivarTipoDocumento: async (id: number) =>
    (
      await httpClient.patch<{ mensaje: string }>(
        `${TIPOS_BASE}/reactivarTipoDocumento/${id}`,
        null,
      )
    ).data,

  /** Obtiene el listado completo de Tipos de Documento (histórico completo). */
  listadoCompletoTiposDocumento: async () =>
    (
      await httpClient.get<TipoDocumentoDTO[]>(`${TIPOS_BASE}/listado-completo`)
    ).data,

  /** Obtiene un único Tipo de Documento por su ID. */
  obtenerTipoDocumento: async (id: number) =>
    (
      await httpClient.get<TipoDocumentoDTO>(
        `${TIPOS_BASE}/ObtenerTipoDocument/${id}`,
      )
    ).data,

  /** Listado de Tipos de Documento activos. */
  listarTiposDocumento: async () =>
    (
      await httpClient.get<TipoDocumentoDTO[]>(
        `${TIPOS_BASE}/listarTiposDocumento`,
      )
    ).data,

  // ── Documentos ────────────────────────────────────────────────────────────

  /**
   * Sube un documento al servidor.
   *
   * El archivo y los metadatos se envían como `multipart/form-data`.
   * La regla de negocio (PDF obligatorio cuando procesarEnRag === true)
   * se valida en el formulario antes de llamar a este método.
   */
  uploadDocumento: async (params: {
    file: File;
    idTipoDocumento: number;
    nombrePersonalizado: string;
    empleadoId?: number;
  }) => {
    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("idTipoDocumento", String(params.idTipoDocumento));
    formData.append("nombrePersonalizado", params.nombrePersonalizado);
    if (params.empleadoId !== undefined) {
      formData.append("empleadoId", String(params.empleadoId));
    }

    return (
      await httpClient.post<DocumentoRespuestaDto>(
        `${DOCS_BASE}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      )
    ).data;
  },

  /** Obtiene la URL o los datos necesarios para visualizar/descargar un documento. */
  visualizarDocumento: async (id: number) =>
    (
      await httpClient.get<DocumentoRespuestaDto>(
        `${DOCS_BASE}/visualizarDocumento/${id}`,
      )
    ).data,

  /** Reactiva un documento previamente dado de baja. */
  reactivarDocumento: async (id: number) =>
    (
      await httpClient.patch<DocumentoRespuestaDto>(
        `${DOCS_BASE}/ReactivarDocumento/${id}`,
        null,
      )
    ).data,

  /** Da de baja (desactiva) un documento por su ID. */
  bajaDocumentacion: async (id: number) =>
    (
      await httpClient.delete<void>(`${DOCS_BASE}/BajaDocumentacion/${id}`)
    ).data,

  /** Listado paginado de documentos con filtros opcionales. */
  listarDocumentos: async (
    filter: DocumentoFilterDto,
    pageable: PageableParams,
  ) =>
    (
      await httpClient.get<SpringPage<DocumentoRespuestaDto>>(
        `${DOCS_BASE}/ListarDocumentos`,
        { params: { ...mapDocumentoFilters(filter), ...pageable } },
      )
    ).data,

  // ── Empleados (para el combobox de asociación de documentos) ────────────────

  /**
   * Busca empleados paginados filtrando por texto libre.
   * Llama a GET /legajos/EmpleadosPaginados?buscar={texto}
   */
  buscarEmpleados: async (buscar: string) =>
    (
      await httpClient.get<SpringPage<EmpleadoResumenDto>>(
        `${LEGAJOS_BASE}/EmpleadosPaginados`,
        { params: { buscar: buscar.trim() || undefined, size: 10, page: 0, sort: "usuario.apellido,asc" } },
      )
    ).data,
};
