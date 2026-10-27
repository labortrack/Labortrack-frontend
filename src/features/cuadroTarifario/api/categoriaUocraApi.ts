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

  /**
   * Con un período pre-liquidado vigente, cambiar la tarifa responde 409
   * CONFIRMACION_REQUERIDA hasta que se reenvía con `confirmar` (RF045).
   */
  modificar: async (
    id: number,
    payload: CategoriaUocraRequestDto,
    confirmar = false,
  ): Promise<CategoriaUocraResponseDto> => {
    const response = await httpClient.put<CategoriaUocraResponseDto>(
      `${BASE_URL}/${id}`,
      payload,
      { params: confirmar ? { confirmar } : undefined },
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
