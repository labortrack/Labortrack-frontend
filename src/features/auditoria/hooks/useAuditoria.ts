import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  obtenerCambios,
  obtenerEntidadesAuditables,
  obtenerHistorial,
} from "../api/auditoria.api";
import type {
  AuditoriaFeedFiltros,
  AuditoriaFeedPage,
  AuditoriaLogDTO,
} from "../types/auditoria.types";

export const auditoriaKeys = {
  all: ["auditoria"] as const,
  entidades: () => [...auditoriaKeys.all, "entidades"] as const,
  historial: (entidad: string, id: number) =>
    [...auditoriaKeys.all, "historial", entidad, id] as const,
  cambios: (entidad: string, filtros?: Omit<AuditoriaFeedFiltros, "page">) =>
    [...auditoriaKeys.all, "cambios", entidad, filtros ?? {}] as const,
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

export type UseCambiosAuditoriaFiltros = Omit<AuditoriaFeedFiltros, "page">;

interface UseCambiosAuditoriaOptions {
  enabled?: boolean;
}

/**
 * Hook de React Query con useInfiniteQuery para obtener los últimos cambios de una entidad con paginación infinita.
 * - La página siguiente se pide solo si hayMas es true.
 * - La clave de caché incluye la entidad y los filtros.
 * - staleTime en 0 para ver siempre lo último al volver a la pantalla.
 */
export function useCambiosAuditoria(
  entidad: string,
  filtros: UseCambiosAuditoriaFiltros = {},
  options?: UseCambiosAuditoriaOptions,
) {
  const isEnabled = (options?.enabled ?? true) && Boolean(entidad.trim());

  return useInfiniteQuery<AuditoriaFeedPage, Error>({
    queryKey: auditoriaKeys.cambios(entidad, filtros),
    queryFn: ({ pageParam }) =>
      obtenerCambios(entidad, {
        ...filtros,
        page: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hayMas ? lastPage.page + 1 : undefined),
    enabled: isEnabled,
    staleTime: 0,
  });
}

// Alias de compatibilidad
export const useAuditoria = useHistorialAuditoria;

