import { httpClient } from "@/shared/lib/http/httpClient";
import type { AuditoriaLogDTO } from "../types/auditoria.types";

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

export const auditoriaApi = {
  obtenerEntidadesAuditables,
  obtenerHistorial,
  // Alias de conveniencia
  getHistorialAuditoria: obtenerHistorial,
};
