import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { legajosApi } from "../api/legajosApi";
import { estructuraLaboralKeys } from "@/features/estructuraLaboral/hooks/useEstructuraLaboral";
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
  fotoUrl: (id: number) => [...legajosKeys.all, "foto", id] as const,
  miLegajo: () => [...legajosKeys.all, "mi-legajo"] as const,
};

export function useMiLegajo() {
  return useQuery({
    queryKey: legajosKeys.miLegajo(),
    queryFn: () => legajosApi.obtenerMiLegajoCompleto(),
  });
}


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

/**
 * Duración de staleTime para la URL firmada de la foto de perfil.
 * El backend (S3StorageService.generarLinkDescarga) genera URLs con duración de 10 minutos (Duration.ofMinutes(10)).
 * Definimos un staleTime menor (8 minutos = 480_000 ms) para asegurar renovación antes de su vencimiento.
 */
export const FOTO_PRESIGNED_URL_STALE_TIME_MS = 8 * 60 * 1000;

export function useFotoPresignedUrl(
  id: number | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: legajosKeys.fotoUrl(id ?? 0),
    queryFn: () => legajosApi.getFotoPresignedUrl(id!),
    enabled: Boolean(id && id > 0 && enabled),
    staleTime: FOTO_PRESIGNED_URL_STALE_TIME_MS,
  });
}

function useInvalidateLegajos() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: legajosKeys.all });
    // El listado de "empleados activos" de Estructura Laboral (usado para
    // asignar grupos) se cachea aparte: sin esto, un alta/baja/reactivacion
    // reciente no aparece ahi hasta que el cache de 30s expira solo.
    queryClient.invalidateQueries({ queryKey: estructuraLaboralKeys.all });
  };
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      payload,
    }: {
      id: number;
      data?: EmpleadoUpdateDto;
      payload?: EmpleadoUpdateDto;
    }) => legajosApi.modificarEmpleado(id, (data ?? payload)!),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: legajosKeys.all });
      queryClient.invalidateQueries({
        queryKey: legajosKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: estructuraLaboralKeys.all });
    },
  });
}

export function useActualizarFotoPerfil() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLegajos();
  return useMutation({
    mutationFn: ({ id, foto }: { id: number; foto: File }) =>
      legajosApi.actualizarFoto(id, foto),
    onSuccess: async (_, variables) => {
      // 1. Invalida y refetchea de inmediato la URL de la foto del empleado para solicitar firma nueva
      await queryClient.invalidateQueries({
        queryKey: legajosKeys.fotoUrl(variables.id),
      });
      await queryClient.refetchQueries({
        queryKey: legajosKeys.fotoUrl(variables.id),
      });
      // 2. Invalida y refetchea miLegajo y legajos generales
      invalidate();
      await queryClient.refetchQueries({ queryKey: legajosKeys.miLegajo() });
      await queryClient.refetchQueries({
        queryKey: legajosKeys.detail(variables.id),
      });
    },
  });
}

export function useBajaEmpleado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      payload,
    }: {
      id: number;
      data?: EmpleadoBajaDto;
      payload?: EmpleadoBajaDto;
    }) => legajosApi.bajaEmpleado(id, (data ?? payload)!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legajosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: legajosKeys.all });
      queryClient.invalidateQueries({ queryKey: estructuraLaboralKeys.all });
    },
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
