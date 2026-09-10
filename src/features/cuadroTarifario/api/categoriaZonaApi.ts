import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  CategoriaZonaRequestDto,
  CategoriaZonaResponseDto,
} from "../types/categoriaZona.types";
import type { CuadroTarifarioDto } from "../types/cuadroTarifario.types";

const BASE_URL = "/labortrack/cuadroTarifario/categoria-zona";

export const categoriaZonaApi = {
  listar: async (
    soloActivas: boolean,
  ): Promise<CategoriaZonaResponseDto[]> => {
    const response = await httpClient.get<CategoriaZonaResponseDto[]>(
      BASE_URL,
      { params: { soloActivas } },
    );
    return response.data;
  },

  crear: async (
    payload: CategoriaZonaRequestDto,
  ): Promise<CategoriaZonaResponseDto> => {
    const response = await httpClient.post<CategoriaZonaResponseDto>(
      BASE_URL,
      payload,
    );
    return response.data;
  },

  modificar: async (
    id: number,
    payload: CategoriaZonaRequestDto,
  ): Promise<CategoriaZonaResponseDto> => {
    const response = await httpClient.put<CategoriaZonaResponseDto>(
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

  obtenerCuadroTarifario: async (): Promise<CuadroTarifarioDto> => {
    const response = await httpClient.get<CuadroTarifarioDto>(
      `${BASE_URL}/cuadro-tarifario`,
    );
    return response.data;
  },
};
