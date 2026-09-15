import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { categoriaUocraApi } from "../api/categoriaUocraApi";
import type {
  CategoriaUocraRequestDto,
  TabFiltroCategoriaUocra,
} from "../types/categoriaUocra.types";

export const categoriasUocraKeys = {
  all: ["categoriasUocra"] as const,
  list: (filtro: TabFiltroCategoriaUocra) =>
    [...categoriasUocraKeys.all, "list", filtro] as const,
  activas: () => [...categoriasUocraKeys.all, "activas"] as const,
};

export function useCategoriasUocra(filtro: TabFiltroCategoriaUocra = "Activos") {
  return useQuery({
    queryKey: categoriasUocraKeys.list(filtro),
    queryFn: async () => {
      const categorias = await categoriaUocraApi.listar(filtro === "Activos");
      return filtro === "Inactivos"
        ? categorias.filter((c) => !c.activo)
        : categorias;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCategoriasUocraActivas() {
  return useQuery({
    queryKey: categoriasUocraKeys.activas(),
    queryFn: () => categoriaUocraApi.listar(true),
  });
}

function useInvalidateCategoriasUocra() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: categoriasUocraKeys.all });
}

export function useCrearCategoriaUocra() {
  const invalidate = useInvalidateCategoriasUocra();
  return useMutation({
    mutationFn: (payload: CategoriaUocraRequestDto) =>
      categoriaUocraApi.crear(payload),
    onSuccess: invalidate,
  });
}

export function useModificarCategoriaUocra() {
  const invalidate = useInvalidateCategoriasUocra();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: CategoriaUocraRequestDto;
    }) => categoriaUocraApi.modificar(id, payload),
    onSuccess: invalidate,
  });
}

export function useBajaCategoriaUocra() {
  const invalidate = useInvalidateCategoriasUocra();
  return useMutation({
    mutationFn: (id: number) => categoriaUocraApi.baja(id),
    onSuccess: invalidate,
  });
}

export function useActivarCategoriaUocra() {
  const invalidate = useInvalidateCategoriasUocra();
  return useMutation({
    mutationFn: (id: number) => categoriaUocraApi.activar(id),
    onSuccess: invalidate,
  });
}
