import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { deduccionApi } from "../api/deduccionApi";
import type {
  DeduccionRequestDto,
  TabFiltroDeduccion,
} from "../types/deduccion.types";

export const deduccionesKeys = {
  all: ["deducciones"] as const,
  list: (filtro: TabFiltroDeduccion) =>
    [...deduccionesKeys.all, "list", filtro] as const,
};

export function useDeducciones(filtro: TabFiltroDeduccion = "Activas") {
  return useQuery({
    queryKey: deduccionesKeys.list(filtro),
    queryFn: async () => {
      const deducciones = await deduccionApi.listar(filtro === "Activas");
      return filtro === "Inactivas"
        ? deducciones.filter((d) => !d.vigente)
        : deducciones;
    },
    placeholderData: keepPreviousData,
  });
}

function useInvalidateDeducciones() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: deduccionesKeys.all });
}

export function useCrearDeduccion() {
  const invalidate = useInvalidateDeducciones();
  return useMutation({
    mutationFn: (payload: DeduccionRequestDto) => deduccionApi.crear(payload),
    onSuccess: invalidate,
  });
}

export function useModificarDeduccion() {
  const invalidate = useInvalidateDeducciones();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DeduccionRequestDto }) =>
      deduccionApi.modificar(id, payload),
    onSuccess: invalidate,
  });
}

export function useBajaDeduccion() {
  const invalidate = useInvalidateDeducciones();
  return useMutation({
    mutationFn: (id: number) => deduccionApi.baja(id),
    onSuccess: invalidate,
  });
}

export function useActivarDeduccion() {
  const invalidate = useInvalidateDeducciones();
  return useMutation({
    mutationFn: (id: number) => deduccionApi.activar(id),
    onSuccess: invalidate,
  });
}
