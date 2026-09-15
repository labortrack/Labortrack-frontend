import { httpClient } from "@/shared/lib/http/httpClient";
import type { ZonaRequestDto, ZonaResponseDto } from "../types/zona.types";

const BASE_URL = "/labortrack/cuadroTarifario/zonas";

export const zonaApi = {
  listar: async (soloActivas: boolean): Promise<ZonaResponseDto[]> => {
    const response = await httpClient.get<ZonaResponseDto[]>(BASE_URL, {
      params: { soloActivas },
    });
    return response.data;
  },

  crear: async (payload: ZonaRequestDto): Promise<ZonaResponseDto> => {
    const response = await httpClient.post<ZonaResponseDto>(BASE_URL, payload);
    return response.data;
  },

  modificar: async (
    id: number,
    payload: ZonaRequestDto,
  ): Promise<ZonaResponseDto> => {
    const response = await httpClient.put<ZonaResponseDto>(
      `${BASE_URL}/${id}`,
      payload,
    );
    return response.data;
  },

  baja: async (id: number): Promise<void> => {
    await httpClient.patch(`${BASE_URL}/${id}/baja`);
  },

  activar: async (id: number): Promise<void> => {
    await httpClient.patch(`${BASE_URL}/${id}/activar`);
  },
};
