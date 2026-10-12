import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  PeriodoLiquidacionModificacionRequestDto,
  PeriodoLiquidacionRequestDto,
  PeriodoLiquidacionResponseDto,
} from "../types/periodoLiquidacion.types";

const BASE_URL = "/labortrack/reciboSueldo/periodos-liquidacion";

export const periodoLiquidacionApi = {
  listar: async (
    soloActivos: boolean,
  ): Promise<PeriodoLiquidacionResponseDto[]> => {
    const response = await httpClient.get<PeriodoLiquidacionResponseDto[]>(
      BASE_URL,
      { params: { soloActivos } },
    );
    return response.data;
  },

  crear: async (
    payload: PeriodoLiquidacionRequestDto,
  ): Promise<PeriodoLiquidacionResponseDto> => {
    const response = await httpClient.post<PeriodoLiquidacionResponseDto>(
      BASE_URL,
      payload,
    );
    return response.data;
  },

  modificar: async (
    id: number,
    payload: PeriodoLiquidacionModificacionRequestDto,
  ): Promise<PeriodoLiquidacionResponseDto> => {
    const response = await httpClient.put<PeriodoLiquidacionResponseDto>(
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
