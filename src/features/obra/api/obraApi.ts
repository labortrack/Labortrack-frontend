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
  // Lista todas las obras o filtra por nomenclatura que coincida parcialmente
  getAll: async (nomenclatura?: string) =>
    (
      await httpClient.get<ObraResponseDto[]>(BASE_URL, {
        params: nomenclatura?.trim()
          ? { nomenclatura: nomenclatura.trim() }
          : undefined,
      })
    ).data,

  // Obtiene una obra por su nomenclatura exacta
  getByNomenclatura: async (valor: string) =>
    (
      await httpClient.get<ObraResponseDto>(`${BASE_URL}/por-nomenclatura`, {
        params: { valor: valor.trim() },
      })
    ).data,

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
