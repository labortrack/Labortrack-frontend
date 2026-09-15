import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { categoriaZonaApi } from "../api/categoriaZonaApi";
import { cuadroTarifarioKeys } from "./useCuadroTarifario";
import type {
  CategoriaZonaRequestDto,
  TabFiltroCategoriaZona,
} from "../types/categoriaZona.types";

export const categoriaZonasKeys = {
  all: ["categoriaZonas"] as const,
  list: (filtro: TabFiltroCategoriaZona) =>
    [...categoriaZonasKeys.all, "list", filtro] as const,
};

export function useCategoriaZonas(filtro: TabFiltroCategoriaZona = "Activos") {
  return useQuery({
    queryKey: categoriaZonasKeys.list(filtro),
    queryFn: async () => {
      const celdas = await categoriaZonaApi.listar(filtro === "Activos");
      return filtro === "Inactivos" ? celdas.filter((c) => !c.activo) : celdas;
    },
    placeholderData: keepPreviousData,
  });
}

function useInvalidateCategoriaZonas() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: categoriaZonasKeys.all });
    queryClient.invalidateQueries({ queryKey: cuadroTarifarioKeys.all });
  };
}

export function useCrearCategoriaZona() {
  const invalidate = useInvalidateCategoriaZonas();
  return useMutation({
    mutationFn: (payload: CategoriaZonaRequestDto) =>
      categoriaZonaApi.crear(payload),
    onSuccess: invalidate,
  });
}

export function useModificarCategoriaZona() {
  const invalidate = useInvalidateCategoriaZonas();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CategoriaZonaRequestDto;
    }) => categoriaZonaApi.modificar(id, payload),
    onSuccess: invalidate,
  });
}

export function useBajaCategoriaZona() {
  const invalidate = useInvalidateCategoriaZonas();
  return useMutation({
    mutationFn: (id: number) => categoriaZonaApi.baja(id),
    onSuccess: invalidate,
  });
}

export function useActivarCategoriaZona() {
  const invalidate = useInvalidateCategoriaZonas();
  return useMutation({
    mutationFn: (id: number) => categoriaZonaApi.activar(id),
    onSuccess: invalidate,
  });
}
