import { useQuery } from "@tanstack/react-query";
import {
  obtenerEntidadesAuditables,
  obtenerHistorial,
} from "../api/auditoria.api";
import type { AuditoriaLogDTO } from "../types/auditoria.types";

export const auditoriaKeys = {
  all: ["auditoria"] as const,
  entidades: () => [...auditoriaKeys.all, "entidades"] as const,
  historial: (entidad: string, id: number) =>
    [...auditoriaKeys.all, "historial", entidad, id] as const,
  // Alias de compatibilidad
  detail: (entidad: string, id: number) =>
    [...auditoriaKeys.all, "historial", entidad, id] as const,
};

/**
 * Hook de React Query para obtener la lista de entidades auditables directamente del backend.
 */
export function useEntidadesAuditables() {
  return useQuery<string[]>({
    queryKey: auditoriaKeys.entidades(),
    queryFn: obtenerEntidadesAuditables,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

interface UseAuditoriaOptions {
  enabled?: boolean;
}

/**
 * Hook de React Query para obtener el historial de auditoría de una entidad específica.
 */
export function useHistorialAuditoria(
  entidad: string,
  id: number,
  options?: UseAuditoriaOptions,
) {
  const isEnabled =
    (options?.enabled ?? true) &&
    Boolean(entidad) &&
    id !== undefined &&
    id !== null &&
    !isNaN(id) &&
    id > 0;

  return useQuery<AuditoriaLogDTO[]>({
    queryKey: auditoriaKeys.historial(entidad, id),
    queryFn: () => obtenerHistorial(entidad, id),
    enabled: isEnabled,
    staleTime: 0,
  });
}

// Alias de compatibilidad
export const useAuditoria = useHistorialAuditoria;
