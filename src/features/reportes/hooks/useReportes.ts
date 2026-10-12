import { useMutation, useQuery } from "@tanstack/react-query";
import { exportarReporte, generarReporte, obtenerTiposReporte } from "../api/reporte.api";
import type {
  FormatoExportacion,
  ReporteFiltros,
  TipoReporte,
} from "../types/reporte.types";

export const reportesKeys = {
  all: ["reportes"] as const,
  tipos: () => [...reportesKeys.all, "tipos"] as const,
  reporte: (tipo: TipoReporte, filtros: ReporteFiltros) =>
    [...reportesKeys.all, "reporte", tipo, filtros] as const,
};

export function useTiposReporte() {
  return useQuery({
    queryKey: reportesKeys.tipos(),
    queryFn: obtenerTiposReporte,
    staleTime: Infinity,
  });
}

/** Se ejecuta solo cuando hay filtros aplicados (el usuario pulsó "Generar"). */
export function useReporte(tipo: TipoReporte | undefined, filtros: ReporteFiltros | undefined) {
  return useQuery({
    queryKey: reportesKeys.reporte(tipo as TipoReporte, filtros ?? {}),
    queryFn: () => generarReporte(tipo as TipoReporte, filtros ?? {}),
    enabled: Boolean(tipo && filtros),
    staleTime: 0,
    retry: false,
  });
}

export function useExportarReporte() {
  return useMutation({
    mutationFn: ({
      tipo,
      filtros,
      formato,
    }: {
      tipo: TipoReporte;
      filtros: ReporteFiltros;
      formato: FormatoExportacion;
    }) => exportarReporte(tipo, filtros, formato),
  });
}
