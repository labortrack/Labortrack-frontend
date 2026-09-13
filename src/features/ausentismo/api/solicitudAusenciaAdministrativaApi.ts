import { httpClient } from "@/shared/lib/http/httpClient";
import type { SpringPage } from "@/shared/types/pagination.types";
import type { TipoSolicitudAusenciaResumen } from "../types/tipoSolicitudAusencia.types";
import type { OpcionesUbicacionAusencia, AccionAdministrativaAusencia, SolicitudAusenciaAdministrativaDetalle, SolicitudAusenciaAdministrativaResumen, SolicitudesAusenciaAdministrativasFiltros } from "../types/solicitudAusenciaAdministrativa.types";

const BASE = "/api/solicitudes-ausencia";
async function obtenerOpcionesPaginadas<T>(consultar: (page: number) => Promise<SpringPage<T>>) {
  const primera = await consultar(0);
  const opciones = [...primera.content];
  for (let page = 1; page < primera.totalPages; page++) {
    opciones.push(...(await consultar(page)).content);
  }
  return opciones;
}
export const solicitudAusenciaAdministrativaApi = {
  listar: async (filtros: SolicitudesAusenciaAdministrativasFiltros) =>
    (await httpClient.get<SpringPage<SolicitudAusenciaAdministrativaResumen>>(BASE, { params: { ...filtros, size: 10 } })).data,
  detalle: async (id: number) =>
    (await httpClient.get<SolicitudAusenciaAdministrativaDetalle>(`${BASE}/${id}`)).data,
  decidir: async (id: number, accion: AccionAdministrativaAusencia, motivo?: string) =>
    (await httpClient.patch<SolicitudAusenciaAdministrativaDetalle>(`${BASE}/${id}/${accion}`, accion === "aceptar" ? undefined : { motivo })).data,
  tiposFiltro: () => obtenerOpcionesPaginadas(async (page) =>
    (await httpClient.get<SpringPage<TipoSolicitudAusenciaResumen>>("/api/tipos-solicitud-ausencia", {
      params: { page, size: 100, sort: ["nombre,asc", "id,asc"] },
      paramsSerializer: { indexes: null },
    })).data),
  ubicacionesFiltro: async (obraId?: number) =>
    (await httpClient.get<OpcionesUbicacionAusencia>(`${BASE}/opciones-filtro`, { params: { obraId } })).data,
};

