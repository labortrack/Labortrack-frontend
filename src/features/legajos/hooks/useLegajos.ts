import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { legajosApi } from "../api/legajosApi";
import type {
  EmpleadoBajaDto,
  EmpleadoDto,
  EmpleadoFilterParams,
  EmpleadoUpdateDto,
  ReactivarLegajoRequestDto,
} from "../types/legajo.types";

export const legajosKeys = {
  all: ["legajos"] as const,
  lists: () => [...legajosKeys.all, "list"] as const,
  list: (filters: EmpleadoFilterParams, page: number, size: number) =>
    [...legajosKeys.all, "list", { filters, page, size }] as const,
  detail: (id: number) => [...legajosKeys.all, "detail", id] as const,
  historial: (id: number) => [...legajosKeys.all, "historial", id] as const,
};

export function useLegajosList(
  filters: EmpleadoFilterParams,
  page: number,
  size = 10,
) {
  return useQuery({
    queryKey: legajosKeys.list(filters, page, size),
    queryFn: () =>
      legajosApi.getPaginados({
        ...filters,
        page,
        size,
        sort: "usuario.apellido,asc",
      }),
    placeholderData: keepPreviousData,
  });
}

export function useLegajoDetail(id: number | null | undefined) {
  return useQuery({
    queryKey: legajosKeys.detail(id ?? 0),
    queryFn: () => legajosApi.getDetalle(id!),
    enabled: Boolean(id && id > 0),
  });
}

export function useHistorialEstados(id: number | null | undefined) {
  return useQuery({
    queryKey: legajosKeys.historial(id ?? 0),
    queryFn: () => legajosApi.getHistorialEstados(id!),
    enabled: Boolean(id && id > 0),
  });
}

function useInvalidateLegajos() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: legajosKeys.all });
}

export function useAltaEmpleado() {
  const invalidate = useInvalidateLegajos();
  return useMutation({
    mutationFn: ({ datos, foto }: { datos: EmpleadoDto; foto?: File }) =>
      legajosApi.alta(datos, foto),
    onSuccess: invalidate,
  });
}

export function useModificarEmpleado() {
  const invalidate = useInvalidateLegajos();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmpleadoUpdateDto }) =>
      legajosApi.modificar(id, payload),
    onSuccess: invalidate,
  });
}

export function useActualizarFotoPerfil() {
  const invalidate = useInvalidateLegajos();
  return useMutation({
    mutationFn: ({ id, foto }: { id: number; foto: File }) =>
      legajosApi.actualizarFoto(id, foto),
    onSuccess: invalidate,
  });
}

export function useBajaEmpleado() {
  const invalidate = useInvalidateLegajos();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EmpleadoBajaDto }) =>
      legajosApi.baja(id, payload),
    onSuccess: invalidate,
  });
}

export function useReactivarEmpleado() {
  const invalidate = useInvalidateLegajos();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ReactivarLegajoRequestDto;
    }) => legajosApi.reactivar(id, payload),
    onSuccess: invalidate,
  });
}
