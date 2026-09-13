import { httpClient } from "@/shared/lib/http/httpClient";
import type { SpringPage } from "@/shared/types/pagination.types";
import type {
  CrearSolicitudAusencia, SolicitudAusenciaCreada, SolicitudAusenciaDetalle,
  SolicitudAusenciaResumen, SolicitudesAusenciaFiltros, TipoAusenciaDisponible, TipoAusenciaOpcion,
} from "../types/solicitudAusencia.types";

const BASE = "/api/solicitudes-ausencia";
export const solicitudAusenciaApi = {
  listarPropias: async (filtros: SolicitudesAusenciaFiltros) =>
    (await httpClient.get<SpringPage<SolicitudAusenciaResumen>>(`${BASE}/mias`, {
      params: { ...filtros, size: 10 },
    })).data,
  detallePropio: async (id: number) =>
    (await httpClient.get<SolicitudAusenciaDetalle>(`${BASE}/mias/${id}`)).data,
  tiposDisponibles: async () =>
    (await httpClient.get<TipoAusenciaDisponible[]>(`${BASE}/tipos-disponibles`)).data,
  tiposFiltroPropios: async () =>
    (await httpClient.get<TipoAusenciaOpcion[]>(`${BASE}/mias/tipos-filtro`)).data,
  crear: async (datos: CrearSolicitudAusencia, documentos: File[]) => {
    const form = new FormData();
    form.append("datos", new Blob([JSON.stringify(datos)], { type: "application/json" }));
    documentos.forEach((archivo) => form.append("documentos", archivo));
    return (await httpClient.post<SolicitudAusenciaCreada>(BASE, form, {
      headers: { "Content-Type": "multipart/form-data" },
    })).data;
  },
};
