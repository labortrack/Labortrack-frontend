import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  resumen: () => [...dashboardKeys.all, "resumen"] as const,
  tendenciaAsistencia: (fechaDesde: string, fechaHasta: string) =>
    [...dashboardKeys.all, "tendencia-asistencia", { fechaDesde, fechaHasta }] as const,
  lecturaRecibos: (meses: number) =>
    [...dashboardKeys.all, "lectura-recibos", { meses }] as const,
};

export function useDashboardResumen(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.resumen(),
    queryFn: () => dashboardApi.getResumen(),
    enabled,
  });
}

export function useLecturaRecibos(meses: number) {
  return useQuery({
    queryKey: dashboardKeys.lecturaRecibos(meses),
    queryFn: () => dashboardApi.getLecturaRecibos(meses),
  });
}

export function useTendenciaAsistencia(fechaDesde: string, fechaHasta: string) {
  return useQuery({
    queryKey: dashboardKeys.tendenciaAsistencia(fechaDesde, fechaHasta),
    queryFn: () => dashboardApi.getTendenciaAsistencia(fechaDesde, fechaHasta),
    enabled: Boolean(fechaDesde) && Boolean(fechaHasta),
  });
}
