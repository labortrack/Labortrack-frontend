import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  CreateEstadoObraDto,
  EstadoObraResponseDto,
  ModifyEstadoObraRequestDto,
} from "../types/estadoObra.types";

const BASE_URL = "/labortrack/configuracion/estados/obras";

export const estadoObraApi = {
  getAll: async () =>
    (await httpClient.get<EstadoObraResponseDto[]>(BASE_URL)).data,

  getActive: async () =>
    (await httpClient.get<EstadoObraResponseDto[]>(`${BASE_URL}/activos`)).data,

  getInactive: async () =>
    (await httpClient.get<EstadoObraResponseDto[]>(`${BASE_URL}/inactivos`))
      .data,

  create: async (payload: CreateEstadoObraDto) =>
    (
      await httpClient.post<EstadoObraResponseDto>(
        `${BASE_URL}/crear`,
        payload,
      )
    ).data,

  modify: async (id: number, payload: ModifyEstadoObraRequestDto) =>
    (
      await httpClient.put<EstadoObraResponseDto>(
        `${BASE_URL}/${id}`,
        payload,
      )
    ).data,

  delete: async (id: number) =>
    (await httpClient.delete<void>(`${BASE_URL}/${id}`)).data,
};
