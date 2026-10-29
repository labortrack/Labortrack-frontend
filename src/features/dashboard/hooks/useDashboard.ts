import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  resumen: (obraId?: number, fecha?: string) =>
    [...dashboardKeys.all, "resumen", { obraId, fecha }] as const,
  tendenciaAsistencia: (fechaDesde: string, fechaHasta: string, obraId?: number) =>
    [...dashboardKeys.all, "tendencia-asistencia", { fechaDesde, fechaHasta, obraId }] as const,
  lecturaRecibos: (meses: number) =>
    [...dashboardKeys.all, "lectura-recibos", { meses }] as const,
};

// Al cambiar el filtro de obra o de fecha se mantienen los datos anteriores mientras llega la
// respuesta, para que el tablero no vuelva al estado de carga en cada click.
export function useDashboardResumen(enabled = true, obraId?: number, fecha?: string) {
  return useQuery({
    queryKey: dashboardKeys.resumen(obraId, fecha),
    queryFn: () => dashboardApi.getResumen(obraId, fecha),
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
