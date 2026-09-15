import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  CategoriaUocraRequestDto,
  CategoriaUocraResponseDto,
} from "../types/categoriaUocra.types";

const BASE_URL = "/labortrack/cuadroTarifario/categorias";

export const categoriaUocraApi = {
  listar: async (soloActivas: boolean): Promise<CategoriaUocraResponseDto[]> => {
    const response = await httpClient.get<CategoriaUocraResponseDto[]>(
      BASE_URL,
      { params: { soloActivas } },
    );
    return response.data;
  },

  crear: async (
    payload: CategoriaUocraRequestDto,
  ): Promise<CategoriaUocraResponseDto> => {
    const response = await httpClient.post<CategoriaUocraResponseDto>(
      BASE_URL,
      payload,
    );
    return response.data;
  },

  modificar: async (
    id: number,
    payload: CategoriaUocraRequestDto,
  ): Promise<CategoriaUocraResponseDto> => {
    const response = await httpClient.put<CategoriaUocraResponseDto>(
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
