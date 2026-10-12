import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  ConceptoAdicionalRequestDto,
  ConceptoAdicionalResponseDto,
} from "../types/conceptoAdicional.types";

const BASE_URL = "/labortrack/reciboSueldo/conceptos-adicionales";

export const conceptoAdicionalApi = {
  listar: async (
    soloActivas: boolean,
  ): Promise<ConceptoAdicionalResponseDto[]> => {
    const response = await httpClient.get<ConceptoAdicionalResponseDto[]>(
      BASE_URL,
      { params: { soloActivas } },
    );
    return response.data;
  },

  crear: async (
    payload: ConceptoAdicionalRequestDto,
  ): Promise<ConceptoAdicionalResponseDto> => {
    const response = await httpClient.post<ConceptoAdicionalResponseDto>(
      BASE_URL,
      payload,
    );
    return response.data;
  },

  modificar: async (
    id: number,
    payload: ConceptoAdicionalRequestDto,
  ): Promise<ConceptoAdicionalResponseDto> => {
    const response = await httpClient.put<ConceptoAdicionalResponseDto>(
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
