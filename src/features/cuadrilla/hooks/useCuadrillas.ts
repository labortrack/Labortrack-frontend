import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { cuadrillaApi } from "../api/cuadrillaApi";
import type {
  AltaCuadrillaRequestDto,
  AltaEmpleadoGrupoCuadrillaRequestDto,
  BajaEmpleadoGrupoCuadrillaRequestDto,
  LiderCuadrillaRequestDto,
  ModificarCuadrillaRequestDto,
} from "../types/cuadrilla.types";

export const cuadrillasKeys = {
  all: ["cuadrillas"] as const,
  lists: () => [...cuadrillasKeys.all, "list"] as const,
  byObra: (obraId: number, page?: number) =>
    [...cuadrillasKeys.all, "obra", obraId, { page }] as const,
  detail: (cuadrillaId: number) =>
    [...cuadrillasKeys.all, "detail", cuadrillaId] as const,
  operarios: (cuadrillaId: number) =>
    [...cuadrillasKeys.all, "operarios", cuadrillaId] as const,
  grupos: () => ["grupos", "list"] as const,
};

export function useCuadrillasPorObra(obraId: number, page = 0, size = 20) {
  return useQuery({
    queryKey: cuadrillasKeys.byObra(obraId, page),
    queryFn: () => cuadrillaApi.getByObraId(obraId, page, size),
    enabled: Boolean(obraId),
    placeholderData: keepPreviousData,
  });
}

export function useCuadrilla(cuadrillaId: number | null | undefined) {
  return useQuery({
    queryKey: cuadrillasKeys.detail(cuadrillaId ?? 0),
    queryFn: () => cuadrillaApi.getById(cuadrillaId!),
    enabled: Boolean(cuadrillaId),
  });
}

export function useOperariosCuadrilla(cuadrillaId: number | null | undefined) {
  return useQuery({
    queryKey: cuadrillasKeys.operarios(cuadrillaId ?? 0),
    queryFn: () => cuadrillaApi.getOperarios(cuadrillaId!),
    enabled: Boolean(cuadrillaId),
  });
}

export function useGrupos() {
  return useQuery({
    queryKey: cuadrillasKeys.grupos(),
    queryFn: () => cuadrillaApi.getGrupos(0, 100),
  });
}

function useInvalidateCuadrillas(obraId?: number, cuadrillaId?: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: cuadrillasKeys.all });
    if (obraId) {
      queryClient.invalidateQueries({
        queryKey: cuadrillasKeys.byObra(obraId),
      });
    }
    if (cuadrillaId) {
      queryClient.invalidateQueries({
        queryKey: cuadrillasKeys.detail(cuadrillaId),
      });
      queryClient.invalidateQueries({
        queryKey: cuadrillasKeys.operarios(cuadrillaId),
      });
    }
  };
}

export function useCreateCuadrilla(obraId: number) {
  const invalidate = useInvalidateCuadrillas(obraId);
  return useMutation({
    mutationFn: (payload: AltaCuadrillaRequestDto) =>
      cuadrillaApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useModifyCuadrilla(obraId: number) {
  const invalidate = useInvalidateCuadrillas(obraId);
  return useMutation({
    mutationFn: ({
      cuadrillaId,
      payload,
    }: {
      cuadrillaId: number;
      payload: ModificarCuadrillaRequestDto;
    }) => cuadrillaApi.modify(cuadrillaId, payload),
    onSuccess: invalidate,
  });
}

export function useAsignarLider(obraId: number) {
  const invalidate = useInvalidateCuadrillas(obraId);
  return useMutation({
    mutationFn: (payload: LiderCuadrillaRequestDto) =>
      cuadrillaApi.asignarLider(payload),
    onSuccess: invalidate,
  });
}

export function useBajaCuadrilla(obraId: number) {
  const invalidate = useInvalidateCuadrillas(obraId);
  return useMutation({
    mutationFn: (cuadrillaId: number) => cuadrillaApi.baja(cuadrillaId),
    onSuccess: invalidate,
  });
}

export function useReactivarCuadrilla(obraId: number) {
  const invalidate = useInvalidateCuadrillas(obraId);
  return useMutation({
    mutationFn: (cuadrillaId: number) => cuadrillaApi.reactivar(cuadrillaId),
    onSuccess: invalidate,
  });
}

export function useAsignarOperario(cuadrillaId: number, obraId?: number) {
  const invalidate = useInvalidateCuadrillas(obraId, cuadrillaId);
  return useMutation({
    mutationFn: (payload: AltaEmpleadoGrupoCuadrillaRequestDto) =>
      cuadrillaApi.asignarOperario(payload),
    onSuccess: invalidate,
  });
}

export function useBajaOperario(cuadrillaId: number, obraId?: number) {
  const invalidate = useInvalidateCuadrillas(obraId, cuadrillaId);
  return useMutation({
    mutationFn: ({
      idEmpleadoGrupoCuadrilla,
      payload,
    }: {
      idEmpleadoGrupoCuadrilla: number;
      payload: BajaEmpleadoGrupoCuadrillaRequestDto;
    }) => cuadrillaApi.bajaOperario(idEmpleadoGrupoCuadrilla, payload),
    onSuccess: invalidate,
  });
}
