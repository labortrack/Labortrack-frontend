import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  AuditoriaFeedFiltros,
  AuditoriaFeedPage,
  AuditoriaLogDTO,
} from "../types/auditoria.types";

/**
 * Obtiene la lista ordenada de claves de entidades auditables disponibles en el backend.
 * GET /api/auditoria/entidades
 */
export const obtenerEntidadesAuditables = async (): Promise<string[]> => {
  const { data } = await httpClient.get<string[]>("/api/auditoria/entidades");
  return data;
};

/**
 * Obtiene el historial de auditoría de una entidad específica por su identificador.
 * Requiere rol de administrador (ROLE_ADMIN).
 * GET /api/auditoria/{entidad}/{id}
 *
 * @param entidad - Clave técnica de la entidad (ej: 'epp', 'obra')
 * @param id - Identificador numérico único del registro auditado
 */
export const obtenerHistorial = async (
  entidad: string,
  id: number,
): Promise<AuditoriaLogDTO[]> => {
  const { data } = await httpClient.get<AuditoriaLogDTO[]>(
    `/api/auditoria/${encodeURIComponent(entidad)}/${encodeURIComponent(id)}`,
  );
  return data;
};

/**
 * Obtiene el feed paginado de cambios recientes de una entidad auditable.
 * Requiere rol de administrador (ROLE_ADMIN).
 * GET /api/auditoria/{entidad}/cambios
 *
 * @param entidad - Clave técnica de la entidad (ej: 'epp', 'obra')
 * @param filtros - Filtros opcionales (page, size, usuario, desde, hasta, operacion)
 */
export const obtenerCambios = async (
  entidad: string,
  filtros: AuditoriaFeedFiltros = {},
): Promise<AuditoriaFeedPage> => {
  const params: Record<string, string | number> = {};

  if (filtros.page !== undefined && filtros.page !== null) {
    params.page = filtros.page;
  }
  if (filtros.size !== undefined && filtros.size !== null) {
    params.size = filtros.size;
  }
  if (filtros.usuario && filtros.usuario.trim() !== "") {
    params.usuario = filtros.usuario.trim();
  }
  if (filtros.desde && filtros.desde.trim() !== "") {
    params.desde = filtros.desde.trim();
  }
  if (filtros.hasta && filtros.hasta.trim() !== "") {
    params.hasta = filtros.hasta.trim();
  }
  if (filtros.operacion && filtros.operacion.trim() !== "") {
    params.operacion = filtros.operacion.trim();
  }

  const { data } = await httpClient.get<AuditoriaFeedPage>(
    `/api/auditoria/${encodeURIComponent(entidad)}/cambios`,
    { params },
  );
  return data;
};

export const auditoriaApi = {
  obtenerEntidadesAuditables,
  obtenerHistorial,
  obtenerCambios,
  // Alias de conveniencia
  getHistorialAuditoria: obtenerHistorial,
};

