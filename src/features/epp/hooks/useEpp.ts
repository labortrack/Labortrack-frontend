import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  activarEpp,
  asignarEpp,
  bajaEpp,
  createEpp,
  getEntregasPaginadas,
  getEntregasPorEmpleado,
  getEpps,
  getMisEntregas,
  reponerStockEpp,
  updateEpp,
} from "../api/epp.api";
import type {
  AltaEppDto,
  ModificarEppDto,
  NuevaEntregaDto,
  ReponerEppDto,
} from "../types/epp.types";

export const eppKeys = {
  all: ["epp"] as const,
  lists: () => [...eppKeys.all, "list"] as const,
  entregas: () => [...eppKeys.all, "entregas"] as const,
  misEntregas: () => [...eppKeys.entregas(), "mis-entregas"] as const,
  entregasPaginadas: (page: number, size: number) =>
    [...eppKeys.entregas(), "paginadas", { page, size }] as const,
  entregasPorEmpleado: (empleadoId: number) =>
    [...eppKeys.entregas(), "empleado", empleadoId] as const,
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
 * Hook para consultar las entregas de EPP asignadas al operario autenticado en sesión.
 */
export function useMisEntregas() {
  return useQuery({
    queryKey: eppKeys.misEntregas(),
    queryFn: getMisEntregas,
  });
}

/**
 * Hook para consultar las entregas de EPP asignadas a un empleado.
 */
export function useEntregasPorEmpleado(empleadoId: number | null | undefined) {
  return useQuery({
    queryKey: eppKeys.entregasPorEmpleado(empleadoId ?? 0),
    queryFn: () => getEntregasPorEmpleado(empleadoId!),
    enabled: Boolean(empleadoId),
  });
}

/**
 * Hook para consultar el historial global paginado de todas las entregas de EPP.
 */
export function useEntregasPaginadas(page = 0, size = 10) {
  return useQuery({
    queryKey: eppKeys.entregasPaginadas(page, size),
    queryFn: () => getEntregasPaginadas(page, size),
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
 * Hook de mutación para registrar y asignar una entrega de EPP a un empleado.
 */
export function useAsignarEpp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NuevaEntregaDto) => asignarEpp(payload),
    onSuccess: () => {
      // Invalida la lista de EPPs para reflejar el descuento de stock
      queryClient.invalidateQueries({ queryKey: eppKeys.lists() });
      // Invalida el historial global de entregas y el del empleado
      queryClient.invalidateQueries({ queryKey: eppKeys.entregas() });
    },
  });
}
