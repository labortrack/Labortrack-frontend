import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { asistenciaApi } from "../api/asistenciaApi";

export const asistenciaKeys = {
  all: ["asistencias"] as const,
  capacidades: () => [...asistenciaKeys.all, "capacidades"] as const,
  propias: () => [...asistenciaKeys.all, "mias"] as const,
  hoy: () => [...asistenciaKeys.propias(), "hoy"] as const,
  historial: (mes: number, anio: number) =>
    [...asistenciaKeys.propias(), "historial", { mes, anio }] as const,
  detallePropio: (asistenciaId: number) =>
    [...asistenciaKeys.propias(), "detalle", asistenciaId] as const,
};

export function useCapacidadesAsistencia() {
  return useQuery({
    queryKey: asistenciaKeys.capacidades(),
    queryFn: asistenciaApi.getCapacidades,
  });
}

export function useAsistenciaHoy() {
  return useQuery({
    queryKey: asistenciaKeys.hoy(),
    queryFn: asistenciaApi.getAsistenciaHoy,
  });
}

export function useHistorialAsistencias(mes: number, anio: number) {
  return useQuery({
    queryKey: asistenciaKeys.historial(mes, anio),
    queryFn: () => asistenciaApi.getHistorial(mes, anio),
    placeholderData: keepPreviousData,
  });
}

export function useDetalleAsistenciaPropia(
  asistenciaId: number | null | undefined,
) {
  return useQuery({
    queryKey: asistenciaKeys.detallePropio(asistenciaId ?? 0),
    queryFn: () => asistenciaApi.getDetallePropio(asistenciaId!),
    enabled: Boolean(asistenciaId),
  });
}
