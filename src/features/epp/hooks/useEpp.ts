import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  activarEpp,
  bajaEpp,
  createEpp,
  getEpps,
  getMisRemitos,
  getRemitosPaginados,
  registrarRemito,
  reponerStockEpp,
  updateEpp,
} from "../api/epp.api";
import type {
  AltaEppDto,
  ModificarEppDto,
  NuevoRemitoDto,
  ReponerEppDto,
} from "../types/epp.types";

export const eppKeys = {
  all: ["epp"] as const,
  lists: () => [...eppKeys.all, "list"] as const,
  remitos: () => [...eppKeys.all, "remitos"] as const,
  misRemitos: () => [...eppKeys.remitos(), "mios"] as const,
  remitosPaginados: (page: number, size: number) =>
    [...eppKeys.remitos(), "paginadas", { page, size }] as const,
};

/**
 * Hook para consultar el catálogo de EPPs.
 */
export function useEpps() {
  return useQuery({
    queryKey: eppKeys.lists(),
    queryFn: getEpps,
  });
}

/** Alias de conveniencia para useEpps */
export const useEpp = useEpps;

/**
 * Hook para consultar los remitos de EPP del usuario autenticado en sesión.
 */
export function useMisRemitos() {
  return useQuery({
    queryKey: eppKeys.misRemitos(),
    queryFn: getMisRemitos,
  });
}

/**
 * Hook para consultar el historial global paginado de remitos de EPP.
 */
export function useRemitosPaginados(page = 0, size = 10) {
  return useQuery({
    queryKey: eppKeys.remitosPaginados(page, size),
    queryFn: () => getRemitosPaginados(page, size),
    placeholderData: keepPreviousData,
  });
}

/**
 * Helper interno para invalidar consultas de EPP en caché.
 */
function useInvalidateEpps() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: eppKeys.all });
}

/**
 * Hook de mutación para dar de alta un nuevo EPP.
 */
export function useCreateEpp() {
  const invalidate = useInvalidateEpps();
  return useMutation({
    mutationFn: (payload: AltaEppDto) => createEpp(payload),
    onSuccess: invalidate,
  });
}

/**
 * Hook de mutación para actualizar los datos de un EPP.
 */
export function useUpdateEpp() {
  const invalidate = useInvalidateEpps();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ModificarEppDto }) =>
      updateEpp(id, payload),
    onSuccess: invalidate,
  });
}

/**
 * Hook de mutación para dar de baja un EPP.
 */
export function useBajaEpp() {
  const invalidate = useInvalidateEpps();
  return useMutation({
    mutationFn: (id: number) => bajaEpp(id),
    onSuccess: invalidate,
  });
}

/**
 * Hook de mutación para reactivar un EPP previamente dado de baja.
 */
export function useActivarEpp() {
  const invalidate = useInvalidateEpps();
  return useMutation({
    mutationFn: (id: number) => activarEpp(id),
    onSuccess: invalidate,
  });
}

/**
 * Hook de mutación para reponer stock de un EPP en el pañol.
 */
export function useReponerStockEpp() {
  const invalidate = useInvalidateEpps();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReponerEppDto }) =>
      reponerStockEpp(id, payload),
    onSuccess: invalidate,
  });
}

/**
 * Hook de mutación para registrar un remito de entrega de EPP con todos sus ítems.
 */
export function useRegistrarRemito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NuevoRemitoDto) => registrarRemito(payload),
    onSuccess: () => {
      // Invalida la lista de EPPs para reflejar el descuento de stock
      queryClient.invalidateQueries({ queryKey: eppKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eppKeys.remitos() });
    },
  });
}
