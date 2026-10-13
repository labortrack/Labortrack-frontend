import { httpClient } from "@/shared/lib/http/httpClient";
import type { ConsultaMisJornadasResponse, MiJornadaDetalle, MisJornadasRango } from "../types/misJornadas.types";

export const misJornadasApi = {
  listar: async (rango: MisJornadasRango, signal?: AbortSignal) => (
    await httpClient.get<ConsultaMisJornadasResponse>("/api/jornadas/mias", {
      params: rango,
      signal,
    })
  ).data,
  detalle: async (jornadaId: number, signal?: AbortSignal) => (
    await httpClient.get<MiJornadaDetalle>(`/api/jornadas/mias/${jornadaId}`, { signal })
  ).data,
};
