import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  resumen: (obraId?: number) => [...dashboardKeys.all, "resumen", { obraId }] as const,
  tendenciaAsistencia: (fechaDesde: string, fechaHasta: string, obraId?: number) =>
    [...dashboardKeys.all, "tendencia-asistencia", { fechaDesde, fechaHasta, obraId }] as const,
  lecturaRecibos: (meses: number) =>
    [...dashboardKeys.all, "lectura-recibos", { meses }] as const,
};

// Al cambiar el filtro de obra se mantienen los datos anteriores mientras llega la
// respuesta, para que el tablero no vuelva al estado de carga en cada click.
export function useDashboardResumen(enabled = true, obraId?: number) {
  return useQuery({
    queryKey: dashboardKeys.resumen(obraId),
    queryFn: () => dashboardApi.getResumen(obraId),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useLecturaRecibos(meses: number) {
  return useQuery({
    queryKey: dashboardKeys.lecturaRecibos(meses),
    queryFn: () => dashboardApi.getLecturaRecibos(meses),
  });
}

export function useTendenciaAsistencia(fechaDesde: string, fechaHasta: string, obraId?: number) {
  return useQuery({
    queryKey: dashboardKeys.tendenciaAsistencia(fechaDesde, fechaHasta, obraId),
    queryFn: () => dashboardApi.getTendenciaAsistencia(fechaDesde, fechaHasta, obraId),
    enabled: Boolean(fechaDesde) && Boolean(fechaHasta),
    placeholderData: keepPreviousData,
  });
}
