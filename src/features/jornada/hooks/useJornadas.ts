import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { jornadaApi } from "../api/jornadaApi";
import type { JornadaFiltros } from "../types/jornada.types";

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
