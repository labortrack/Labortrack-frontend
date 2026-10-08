import { httpClient } from "@/shared/lib/http/httpClient";
import type { ConsultaJornadasResponse, JornadaDetalle, JornadaFiltros, JornadaResumen } from "../types/jornada.types";

const params = (filtros: JornadaFiltros) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filtros)) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  query.set("page", String(filtros.page ?? 0));
  query.set("size", String(filtros.size ?? 20));
  query.append("sort", "fechaJornadaTrabajo,asc");
  query.append("sort", "id,asc");
  return query;
};

export const jornadaApi = {
  listar: async (filtros: JornadaFiltros, cuadrillaId?: number, signal?: AbortSignal) => (
    await httpClient.get<ConsultaJornadasResponse>(
      cuadrillaId ? `/api/cuadrillas/${cuadrillaId}/jornadas` : "/api/jornadas",
      { params: params(filtros), signal },
    )
  ).data,
  detalle: async (jornadaId: number, signal?: AbortSignal) => (
    await httpClient.get<JornadaDetalle>(`/api/jornadas/${jornadaId}`, { signal })
  ).data,
  listarSemana: async (filtros: JornadaFiltros, cuadrillaId?: number, signal?: AbortSignal): Promise<JornadaResumen[]> => {
    const jornadas: JornadaResumen[] = [];
    let page = 0;
    let totalPages: number;
    do {
      const result = await jornadaApi.listar({ ...filtros, page, size: 100 }, cuadrillaId, signal);
      jornadas.push(...result.jornadas.content);
      totalPages = result.jornadas.totalPages;
      page++;
    } while (page < totalPages);
    return jornadas;
  },
};
