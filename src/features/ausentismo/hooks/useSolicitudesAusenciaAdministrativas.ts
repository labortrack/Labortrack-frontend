import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { solicitudAusenciaAdministrativaApi as api } from "../api/solicitudAusenciaAdministrativaApi";
import type { AccionAdministrativaAusencia, SolicitudesAusenciaAdministrativasFiltros } from "../types/solicitudAusenciaAdministrativa.types";

export const solicitudesAusenciaAdministrativasKeys = {
  all: ["solicitudes-ausencia", "administrativas"] as const,
  lista: (filtros: SolicitudesAusenciaAdministrativasFiltros) => [...solicitudesAusenciaAdministrativasKeys.all, "lista", filtros] as const,
  detalle: (id: number) => [...solicitudesAusenciaAdministrativasKeys.all, "detalle", id] as const,
};
export function useSolicitudesAusenciaAdministrativas(filtros: SolicitudesAusenciaAdministrativasFiltros, enabled: boolean) {
  return useQuery({ queryKey: solicitudesAusenciaAdministrativasKeys.lista(filtros), queryFn: () => api.listar(filtros), enabled, placeholderData: keepPreviousData });
}
export function useSolicitudAusenciaAdministrativaDetalle(id: number | null) {
  return useQuery({ queryKey: solicitudesAusenciaAdministrativasKeys.detalle(id ?? 0), queryFn: () => api.detalle(id!), enabled: id !== null });
}
export function useOpcionesAusenciaAdministrativas(obraId?: number) {
  const tipos = useQuery({ queryKey: ["tipos-solicitud-ausencia", "opciones-rrhh"], queryFn: api.tiposFiltro });
  const ubicaciones = useQuery({ queryKey: ["ausentismo", "ubicaciones-filtro", obraId], queryFn: () => api.ubicacionesFiltro(obraId) });
  return { tipos, ubicaciones };
}
export function useDecidirSolicitudAusencia(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ accion, motivo }: { accion: AccionAdministrativaAusencia; motivo?: string }) => api.decidir(id, accion, motivo),
    onSuccess: (detalle) => {
      client.setQueryData(solicitudesAusenciaAdministrativasKeys.detalle(id), detalle);
      void client.invalidateQueries({ queryKey: solicitudesAusenciaAdministrativasKeys.all, predicate: (query) => !query.queryKey.includes("detalle") });
      void client.invalidateQueries({ queryKey: ["solicitudes-ausencia", "mias"] });
      void client.invalidateQueries({ queryKey: ["asistencias"] });
      void client.invalidateQueries({ queryKey: ["legajos"] });
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: solicitudesAusenciaAdministrativasKeys.all });
    },
  });
}

