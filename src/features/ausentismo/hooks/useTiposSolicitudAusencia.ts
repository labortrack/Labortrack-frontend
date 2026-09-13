import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tipoSolicitudAusenciaApi } from "../api/tipoSolicitudAusenciaApi";
import type { TipoSolicitudAusenciaDetalle, TipoSolicitudAusenciaReglas, TiposSolicitudAusenciaFiltros } from "../types/tipoSolicitudAusencia.types";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export const tiposAusenciaKeys = {
  all: ["tipos-solicitud-ausencia"] as const,
  listas: ["tipos-solicitud-ausencia", "lista"] as const,
  lista: (filtros: TiposSolicitudAusenciaFiltros) => [...tiposAusenciaKeys.listas, filtros] as const,
  detalle: (id: number) => [...tiposAusenciaKeys.all, "detalle", id] as const,
};

export function useTiposSolicitudAusencia(filtros: TiposSolicitudAusenciaFiltros) {
  return useQuery({
    queryKey: tiposAusenciaKeys.lista(filtros),
    queryFn: () => tipoSolicitudAusenciaApi.listar(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useTipoSolicitudAusenciaDetalle(id: number | null) {
  return useQuery({
    queryKey: tiposAusenciaKeys.detalle(id ?? 0),
    queryFn: () => tipoSolicitudAusenciaApi.detalle(id!),
    enabled: id !== null,
  });
}

export function useGuardarTipoSolicitudAusencia(id?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: TipoSolicitudAusenciaReglas) => id === undefined
      ? tipoSolicitudAusenciaApi.crear(datos)
      : tipoSolicitudAusenciaApi.modificar(id, datos),
    onSuccess: async (detalle: TipoSolicitudAusenciaDetalle) => {
      queryClient.setQueryData(tiposAusenciaKeys.detalle(detalle.id), detalle);
      await queryClient.invalidateQueries({ queryKey: tiposAusenciaKeys.listas });
    },
    onError: async (error) => {
      if (id !== undefined && [400, 404, 409].includes(normalizeApiError(error).status ?? 0)) {
        await queryClient.invalidateQueries({ queryKey: tiposAusenciaKeys.all });
      }
    },
  });
}

export function useDesactivarTipoSolicitudAusencia(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => tipoSolicitudAusenciaApi.desactivar(id),
    onSuccess: async (detalle) => {
      queryClient.setQueryData(tiposAusenciaKeys.detalle(id), detalle);
      await queryClient.invalidateQueries({ queryKey: tiposAusenciaKeys.listas });
    },
    onError: async (error) => {
      if ([400, 404, 409].includes(normalizeApiError(error).status ?? 0)) {
        await queryClient.invalidateQueries({ queryKey: tiposAusenciaKeys.all });
      }
    },
  });
}
