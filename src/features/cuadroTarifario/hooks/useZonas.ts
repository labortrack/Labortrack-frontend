import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { zonaApi } from "../api/zonaApi";
import type { TabFiltroZona, ZonaRequestDto } from "../types/zona.types";

export const zonasKeys = {
  all: ["zonas"] as const,
  list: (filtro: TabFiltroZona) => [...zonasKeys.all, "list", filtro] as const,
  activas: () => [...zonasKeys.all, "activas"] as const,
};

export function useZonas(filtro: TabFiltroZona = "Activos") {
  return useQuery({
    queryKey: zonasKeys.list(filtro),
    queryFn: async () => {
      const zonas = await zonaApi.listar(filtro === "Activos");
      return filtro === "Inactivos" ? zonas.filter((z) => !z.activo) : zonas;
    },
    placeholderData: keepPreviousData,
  });
}

export function useZonasActivas() {
  return useQuery({
    queryKey: zonasKeys.activas(),
    queryFn: () => zonaApi.listar(true),
  });
}

function useInvalidateZonas() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: zonasKeys.all });
}

export function useCrearZona() {
  const invalidate = useInvalidateZonas();
  return useMutation({
    mutationFn: (payload: ZonaRequestDto) => zonaApi.crear(payload),
    onSuccess: invalidate,
  });
}

export function useModificarZona() {
  const invalidate = useInvalidateZonas();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ZonaRequestDto }) =>
      zonaApi.modificar(id, payload),
    onSuccess: invalidate,
  });
}

export function useBajaZona() {
  const invalidate = useInvalidateZonas();
  return useMutation({
    mutationFn: (id: number) => zonaApi.baja(id),
    onSuccess: invalidate,
  });
}

export function useActivarZona() {
  const invalidate = useInvalidateZonas();
  return useMutation({
    mutationFn: (id: number) => zonaApi.activar(id),
    onSuccess: invalidate,
  });
}
