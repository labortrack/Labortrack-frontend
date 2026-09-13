import { httpClient } from "@/shared/lib/http/httpClient";
import type { SpringPage } from "@/shared/types/pagination.types";
import type {
  TipoSolicitudAusenciaDetalle,
  TipoSolicitudAusenciaReglas,
  TipoSolicitudAusenciaResumen,
  TiposSolicitudAusenciaFiltros,
} from "../types/tipoSolicitudAusencia.types";

const BASE = "/api/tipos-solicitud-ausencia";

export const tipoSolicitudAusenciaApi = {
  listar: async (filtros: TiposSolicitudAusenciaFiltros) =>
    (await httpClient.get<SpringPage<TipoSolicitudAusenciaResumen>>(BASE, {
      params: { ...filtros, size: 10, sort: ["nombre,asc", "id,asc"] },
      paramsSerializer: { indexes: null },
    })).data,
  detalle: async (id: number) =>
    (await httpClient.get<TipoSolicitudAusenciaDetalle>(`${BASE}/${id}`)).data,
  crear: async (datos: TipoSolicitudAusenciaReglas) =>
    (await httpClient.post<TipoSolicitudAusenciaDetalle>(BASE, datos)).data,
  modificar: async (id: number, datos: TipoSolicitudAusenciaReglas) =>
    (await httpClient.put<TipoSolicitudAusenciaDetalle>(`${BASE}/${id}`, datos)).data,
  desactivar: async (id: number) =>
    (await httpClient.patch<TipoSolicitudAusenciaDetalle>(`${BASE}/${id}/desactivar`)).data,
};
