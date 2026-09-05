import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { asistenciaApi } from "../api/asistenciaApi";
import type {
  ConfirmarQrRequestDto,
  ParteDiarioFiltros,
  TipoOperacionQr,
  ValidarQrRequestDto,
} from "../types/asistencia.types";

export const asistenciaKeys = {
  all: ["asistencias"] as const,
  capacidades: () => [...asistenciaKeys.all, "capacidades"] as const,
  propias: () => [...asistenciaKeys.all, "mias"] as const,
  hoy: () => [...asistenciaKeys.propias(), "hoy"] as const,
  periodoDisponible: () =>
    [...asistenciaKeys.propias(), "periodo-disponible"] as const,
  historial: (mes: number, anio: number, page: number, size: number) =>
    [
      ...asistenciaKeys.propias(),
      "historial",
      { mes, anio, page, size },
    ] as const,
  detallePropio: (asistenciaId: number) =>
    [...asistenciaKeys.propias(), "detalle", asistenciaId] as const,
  parteDiario: (filtros: ParteDiarioFiltros) =>
    [...asistenciaKeys.all, "parte-diario", filtros] as const,
  opcionesFiltro: (fecha: string) =>
    [...asistenciaKeys.all, "opciones-filtro", fecha] as const,
  detalleOperativo: (asistenciaId: number) =>
    [...asistenciaKeys.all, "detalle-operativo", asistenciaId] as const,
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

export function usePeriodoDisponibleAsistencia() {
  return useQuery({
    queryKey: asistenciaKeys.periodoDisponible(),
    queryFn: asistenciaApi.getPeriodoDisponible,
  });
}

export function useHistorialAsistencias(
  mes: number,
  anio: number,
  page: number,
  size = 10,
) {
  return useQuery({
    queryKey: asistenciaKeys.historial(mes, anio, page, size),
    queryFn: () => asistenciaApi.getHistorial(mes, anio, page, size),
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

export function useValidarAsistenciaQr(tipo: TipoOperacionQr) {
  return useMutation({
    mutationFn: (request: ValidarQrRequestDto) =>
      tipo === "ingreso"
        ? asistenciaApi.validarIngresoQr(request)
        : asistenciaApi.validarEgresoQr(request),
  });
}

export function useConfirmarAsistenciaQr(tipo: TipoOperacionQr) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ConfirmarQrRequestDto) =>
      tipo === "ingreso"
        ? asistenciaApi.confirmarIngresoQr(request)
        : asistenciaApi.confirmarEgresoQr(request),
    onSuccess: (asistenciaActualizada) => {
      queryClient.setQueryData(
        asistenciaKeys.hoy(),
        asistenciaActualizada,
      );
      void queryClient.invalidateQueries({
        queryKey: asistenciaKeys.propias(),
      });
    },
  });
}

export function useParteDiarioAsistencia(filtros: ParteDiarioFiltros) {
  return useQuery({
    queryKey: asistenciaKeys.parteDiario(filtros),
    queryFn: () => asistenciaApi.getParteDiario(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useOpcionesFiltroAsistencia(fecha: string) {
  return useQuery({
    queryKey: asistenciaKeys.opcionesFiltro(fecha),
    queryFn: () => asistenciaApi.getOpcionesFiltro(fecha),
  });
}

export function useDetalleAsistenciaOperativa(
  asistenciaId: number | null | undefined,
) {
  return useQuery({
    queryKey: asistenciaKeys.detalleOperativo(asistenciaId ?? 0),
    queryFn: () => asistenciaApi.getDetalleOperativo(asistenciaId!),
    enabled: Boolean(asistenciaId),
  });
}
