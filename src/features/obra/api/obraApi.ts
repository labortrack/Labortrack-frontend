import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  BajaObraRequestDto,
  CreateObraDto,
  HistorialEstadoObraDto,
  ModifyObraRequestDto,
  ObraResponseDto,
  TransicionarEstadoObraDto,
} from "../types/obra.types";

const BASE_URL = "/labortrack/obras";

export const obraApi = {
  getAll: async () =>
    (await httpClient.get<ObraResponseDto[]>(BASE_URL)).data,

  getById: async (id: number) =>
    (await httpClient.get<ObraResponseDto>(`${BASE_URL}/${id}`)).data,

  create: async (payload: CreateObraDto) =>
    (await httpClient.post<ObraResponseDto>(`${BASE_URL}/crear`, payload)).data,

  modify: async (id: number, payload: ModifyObraRequestDto) =>
    (await httpClient.put<ObraResponseDto>(`${BASE_URL}/${id}`, payload)).data,

  baja: async (id: number, payload: BajaObraRequestDto) =>
    (
      await httpClient.post<ObraResponseDto>(
        `${BASE_URL}/${id}/baja`,
        payload,
      )
    ).data,

  cambiarEstado: async (id: number, payload: TransicionarEstadoObraDto) =>
    (
      await httpClient.post<ObraResponseDto>(
        `${BASE_URL}/${id}/cambiar-estado`,
        payload,
      )
    ).data,

  getHistorialEstados: async (id: number) =>
    (
      await httpClient.get<HistorialEstadoObraDto[]>(
        `${BASE_URL}/${id}/historial-estados`,
      )
    ).data,
};
