import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { periodoLiquidacionApi } from "../api/periodoLiquidacionApi";
import type {
  PeriodoLiquidacionModificacionRequestDto,
  PeriodoLiquidacionRequestDto,
  TabFiltroPeriodo,
} from "../types/periodoLiquidacion.types";

export const periodosLiquidacionKeys = {
  all: ["periodosLiquidacion"] as const,
  list: (filtro: TabFiltroPeriodo) =>
    [...periodosLiquidacionKeys.all, "list", filtro] as const,
};

export function usePeriodosLiquidacion(filtro: TabFiltroPeriodo = "Activos") {
  return useQuery({
    queryKey: periodosLiquidacionKeys.list(filtro),
    queryFn: async () => {
      const periodos = await periodoLiquidacionApi.listar(filtro === "Activos");
      const filtrados =
        filtro === "Inactivos" ? periodos.filter((p) => !p.vigente) : periodos;
      // Los más recientes primero.
      return [...filtrados].sort((a, b) =>
        b.fechaDesde.localeCompare(a.fechaDesde),
      );
    },
    placeholderData: keepPreviousData,
  });
}

function useInvalidatePeriodosLiquidacion() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: periodosLiquidacionKeys.all });
}

export function useCrearPeriodoLiquidacion() {
  const invalidate = useInvalidatePeriodosLiquidacion();
  return useMutation({
    mutationFn: (payload: PeriodoLiquidacionRequestDto) =>
      periodoLiquidacionApi.crear(payload),
    onSuccess: invalidate,
  });
}

export function useModificarPeriodoLiquidacion() {
  const invalidate = useInvalidatePeriodosLiquidacion();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PeriodoLiquidacionModificacionRequestDto;
    }) => periodoLiquidacionApi.modificar(id, payload),
    onSuccess: invalidate,
  });
}

export function useBajaPeriodoLiquidacion() {
  const invalidate = useInvalidatePeriodosLiquidacion();
  return useMutation({
    mutationFn: (id: number) => periodoLiquidacionApi.baja(id),
    onSuccess: invalidate,
  });
}

export function useActivarPeriodoLiquidacion() {
  const invalidate = useInvalidatePeriodosLiquidacion();
  return useMutation({
    mutationFn: (id: number) => periodoLiquidacionApi.activar(id),
    onSuccess: invalidate,
  });
}
