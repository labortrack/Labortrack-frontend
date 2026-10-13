import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jornadaApi } from "../api/jornadaApi";
import type { AnularJornadaRequest, DefinirDecisionJornadaRequest, JornadaFiltros, ModificarHorarioJornadaRequest } from "../types/jornada.types";
import { planesTrabajoKeys } from "./usePlanesTrabajo";
import { misJornadasKeys } from "./useMisJornadas";
import { asistenciaKeys } from "@/features/asistencia/hooks/useAsistencias";
import { dashboardKeys } from "@/features/dashboard/hooks/useDashboard";

export const jornadasKeys = {
  all: ["jornadas"] as const,
  list: (scope: number | null, filtros: JornadaFiltros) => ["jornadas", "list", scope, filtros] as const,
  week: (scope: number | null, filtros: JornadaFiltros) => ["jornadas", "week", scope, filtros] as const,
  detail: (id: number) => ["jornadas", "detail", id] as const,
};

export function useJornadas(filtros: JornadaFiltros, cuadrillaId?: number, enabled = true) {
  return useQuery({
    queryKey: jornadasKeys.list(cuadrillaId ?? null, filtros),
    queryFn: ({ signal }) => jornadaApi.listar(filtros, cuadrillaId, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useJornadasSemana(filtros: JornadaFiltros, cuadrillaId?: number, enabled = true) {
  return useQuery({
    queryKey: jornadasKeys.week(cuadrillaId ?? null, filtros),
    queryFn: ({ signal }) => jornadaApi.listarSemana(filtros, cuadrillaId, signal),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useJornadaDetalle(jornadaId: number) {
  return useQuery({
    queryKey: jornadasKeys.detail(jornadaId),
    queryFn: ({ signal }) => jornadaApi.detalle(jornadaId, signal),
    enabled: Number.isInteger(jornadaId) && jornadaId > 0,
  });
}

function useInvalidarJornada() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: jornadasKeys.all }),
      queryClient.invalidateQueries({ queryKey: planesTrabajoKeys.all }),
      queryClient.invalidateQueries({ queryKey: misJornadasKeys.all }),
      queryClient.invalidateQueries({ queryKey: asistenciaKeys.all }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
  };
}

export function useModificarHorarioJornada(jornadaId: number) {
  const invalidar = useInvalidarJornada();
  return useMutation({
    mutationFn: (payload: ModificarHorarioJornadaRequest) => jornadaApi.modificarHorario(jornadaId, payload),
    onSuccess: invalidar,
  });
}

export function useDefinirDecisionJornada(jornadaId: number) {
  const invalidar = useInvalidarJornada();
  return useMutation({
    mutationFn: (payload: DefinirDecisionJornadaRequest) => jornadaApi.definirDecision(jornadaId, payload),
    onSuccess: invalidar,
  });
}

export function useAnularJornada(jornadaId: number) {
  const invalidar = useInvalidarJornada();
  return useMutation({
    mutationFn: (payload: AnularJornadaRequest) => jornadaApi.anular(jornadaId, payload),
    onSuccess: invalidar,
  });
}
