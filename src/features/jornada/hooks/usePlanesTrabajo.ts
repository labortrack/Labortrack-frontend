import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { planTrabajoApi } from "../api/planTrabajoApi";
import type {
  CrearJornadaExtraordinariaRequestDto,
  CerrarPlanTrabajoRequestDto,
  CrearPlanTrabajoRequestDto,
  JornadaPlanFiltros,
  ModificarPlanTrabajoRequestDto,
  PlanTrabajoFiltros,
} from "../types/planTrabajo.types";
import { cuadrillasKeys } from "@/features/cuadrilla/hooks/useCuadrillas";
import { dashboardKeys } from "@/features/dashboard/hooks/useDashboard";
import { asistenciaKeys } from "@/features/asistencia/hooks/useAsistencias";

export const planesTrabajoKeys = {
  all: ["planes-trabajo"] as const,
  list: (cuadrillaId: number, filtros: PlanTrabajoFiltros) =>
    [...planesTrabajoKeys.all, "list", cuadrillaId, filtros] as const,
  detail: (
    cuadrillaId: number,
    planId: number,
    filtros: JornadaPlanFiltros,
  ) =>
    [
      ...planesTrabajoKeys.all,
      "detail",
      cuadrillaId,
      planId,
      filtros,
    ] as const,
};

export function usePlanesTrabajo(
  cuadrillaId: number | null | undefined,
  filtros: PlanTrabajoFiltros,
) {
  return useQuery({
    queryKey: planesTrabajoKeys.list(cuadrillaId ?? 0, filtros),
    queryFn: () => planTrabajoApi.listar(cuadrillaId!, filtros),
    enabled: Boolean(cuadrillaId),
    placeholderData: keepPreviousData,
  });
}

export function usePlanTrabajoDetalle(
  cuadrillaId: number | null | undefined,
  planId: number | null | undefined,
  filtros: JornadaPlanFiltros,
) {
  return useQuery({
    queryKey: planesTrabajoKeys.detail(
      cuadrillaId ?? 0,
      planId ?? 0,
      filtros,
    ),
    queryFn: () =>
      planTrabajoApi.obtenerDetalle(cuadrillaId!, planId!, filtros),
    enabled: Boolean(cuadrillaId && planId),
    placeholderData: keepPreviousData,
  });
}

function useInvalidatePlanificacion(cuadrillaId: number) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: planesTrabajoKeys.all }),
      queryClient.invalidateQueries({ queryKey: cuadrillasKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.all }),
      queryClient.invalidateQueries({
        queryKey: cuadrillasKeys.detail(cuadrillaId),
      }),
    ]);
  };
}

export function useCrearPlanTrabajo(cuadrillaId: number) {
  const invalidate = useInvalidatePlanificacion(cuadrillaId);
  return useMutation({
    mutationFn: (payload: CrearPlanTrabajoRequestDto) =>
      planTrabajoApi.crear(cuadrillaId, payload),
    onSuccess: invalidate,
  });
}

export function useModificarPlanTrabajo(
  cuadrillaId: number,
  planId: number,
) {
  const invalidate = useInvalidatePlanificacion(cuadrillaId);
  return useMutation({
    mutationFn: (payload: ModificarPlanTrabajoRequestDto) =>
      planTrabajoApi.modificar(cuadrillaId, planId, payload),
    onSuccess: invalidate,
  });
}

export function useCrearJornadaExtraordinaria(
  cuadrillaId: number,
  planId: number,
) {
  const invalidate = useInvalidatePlanificacion(cuadrillaId);
  return useMutation({
    mutationFn: (payload: CrearJornadaExtraordinariaRequestDto) =>
      planTrabajoApi.crearJornadaExtraordinaria(
        cuadrillaId,
        planId,
        payload,
      ),
    onSuccess: invalidate,
  });
}

export function useCerrarPlanTrabajo(
  cuadrillaId: number,
  planId: number,
  accion: "cancelar" | "finalizar",
) {
  const invalidate = useInvalidatePlanificacion(cuadrillaId);
  return useMutation({
    mutationFn: (payload: CerrarPlanTrabajoRequestDto) =>
      accion === "cancelar"
        ? planTrabajoApi.cancelar(cuadrillaId, planId, payload)
        : planTrabajoApi.finalizarAnticipadamente(
            cuadrillaId,
            planId,
            payload,
          ),
    onSuccess: invalidate,
  });
}
