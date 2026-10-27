import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  DeduccionRequestDto,
  DeduccionResponseDto,
} from "../types/deduccion.types";

const BASE_URL = "/labortrack/reciboSueldo/deducciones";

export const deduccionApi = {
  listar: async (soloActivas: boolean): Promise<DeduccionResponseDto[]> => {
    const response = await httpClient.get<DeduccionResponseDto[]>(BASE_URL, {
      params: { soloActivas },
    });
    return response.data;
  },

  crear: async (payload: DeduccionRequestDto): Promise<DeduccionResponseDto> => {
    const response = await httpClient.post<DeduccionResponseDto>(
      BASE_URL,
      payload,
    );
    return response.data;
  },

  modificar: async (
    id: number,
    payload: DeduccionRequestDto,
  ): Promise<DeduccionResponseDto> => {
    const response = await httpClient.put<DeduccionResponseDto>(
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
