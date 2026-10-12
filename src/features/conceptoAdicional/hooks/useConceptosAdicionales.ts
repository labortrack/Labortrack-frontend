import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { conceptoAdicionalApi } from "../api/conceptoAdicionalApi";
import type {
  ConceptoAdicionalRequestDto,
  TabFiltroConcepto,
} from "../types/conceptoAdicional.types";

export const conceptosAdicionalesKeys = {
  all: ["conceptosAdicionales"] as const,
  list: (filtro: TabFiltroConcepto) =>
    [...conceptosAdicionalesKeys.all, "list", filtro] as const,
};

export function useConceptosAdicionales(filtro: TabFiltroConcepto = "Activos") {
  return useQuery({
    queryKey: conceptosAdicionalesKeys.list(filtro),
    queryFn: async () => {
      const conceptos = await conceptoAdicionalApi.listar(filtro === "Activos");
      return filtro === "Inactivos"
        ? conceptos.filter((c) => !c.vigente)
        : conceptos;
    },
    placeholderData: keepPreviousData,
  });
}

function useInvalidateConceptosAdicionales() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: conceptosAdicionalesKeys.all });
}

export function useCrearConceptoAdicional() {
  const invalidate = useInvalidateConceptosAdicionales();
  return useMutation({
    mutationFn: (payload: ConceptoAdicionalRequestDto) =>
      conceptoAdicionalApi.crear(payload),
    onSuccess: invalidate,
  });
}

export function useModificarConceptoAdicional() {
  const invalidate = useInvalidateConceptosAdicionales();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ConceptoAdicionalRequestDto;
    }) => conceptoAdicionalApi.modificar(id, payload),
    onSuccess: invalidate,
  });
}

export function useBajaConceptoAdicional() {
  const invalidate = useInvalidateConceptosAdicionales();
  return useMutation({
    mutationFn: (id: number) => conceptoAdicionalApi.baja(id),
    onSuccess: invalidate,
  });
}

export function useActivarConceptoAdicional() {
  const invalidate = useInvalidateConceptosAdicionales();
  return useMutation({
    mutationFn: (id: number) => conceptoAdicionalApi.activar(id),
    onSuccess: invalidate,
  });
}
