import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { solicitudAusenciaApi } from "../api/solicitudAusenciaApi";
import type { CrearSolicitudAusencia, SolicitudesAusenciaFiltros } from "../types/solicitudAusencia.types";

export const solicitudesAusenciaKeys = {
  propias: ["solicitudes-ausencia", "mias"] as const,
  lista: (filtros: SolicitudesAusenciaFiltros) => [...solicitudesAusenciaKeys.propias, "lista", filtros] as const,
  detalle: (id: number) => [...solicitudesAusenciaKeys.propias, "detalle", id] as const,
  tiposFiltro: ["solicitudes-ausencia", "mias", "tipos-filtro"] as const,
  tiposDisponibles: ["tipos-solicitud-ausencia", "disponibles-operario"] as const,
};
export function useMisSolicitudesAusencia(filtros: SolicitudesAusenciaFiltros, habilitado = true) {
  return useQuery({
    queryKey: solicitudesAusenciaKeys.lista(filtros),
    queryFn: () => solicitudAusenciaApi.listarPropias(filtros),
    placeholderData: keepPreviousData,
    enabled: habilitado,
  });
}
export function useMiSolicitudAusenciaDetalle(id: number | null) {
  return useQuery({
    queryKey: solicitudesAusenciaKeys.detalle(id ?? 0),
    queryFn: () => solicitudAusenciaApi.detallePropio(id!),
    enabled: id !== null,
  });
}
export function useTiposAusenciaDisponibles() {
  return useQuery({ queryKey: solicitudesAusenciaKeys.tiposDisponibles, queryFn: solicitudAusenciaApi.tiposDisponibles });
}
export function useTiposFiltroAusenciaPropios() {
  return useQuery({ queryKey: solicitudesAusenciaKeys.tiposFiltro, queryFn: solicitudAusenciaApi.tiposFiltroPropios });
}
export function useCrearSolicitudAusencia() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ datos, documentos }: { datos: CrearSolicitudAusencia; documentos: File[] }) =>
      solicitudAusenciaApi.crear(datos, documentos),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: solicitudesAusenciaKeys.propias });
    },
  });
}
