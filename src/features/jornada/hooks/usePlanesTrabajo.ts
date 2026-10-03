import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { planTrabajoApi } from "../api/planTrabajoApi";
import type {
  JornadaPlanFiltros,
  PlanTrabajoFiltros,
} from "../types/planTrabajo.types";

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
