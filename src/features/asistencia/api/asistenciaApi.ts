import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  AsistenciaDetalleResponseDto,
  AsistenciaHistorialResponseDto,
  AsistenciaHoyResponseDto,
  CapacidadesAsistenciaResponseDto,
} from "../types/asistencia.types";

const BASE_URL = "/api/asistencias";

export const asistenciaApi = {
  getCapacidades: async () =>
    (
      await httpClient.get<CapacidadesAsistenciaResponseDto>(
        `${BASE_URL}/capacidades`,
      )
    ).data,

  getAsistenciaHoy: async (): Promise<AsistenciaHoyResponseDto | null> => {
    const response = await httpClient.get<AsistenciaHoyResponseDto | null>(
      `${BASE_URL}/mias/hoy`,
    );

    return response.status === 204 ? null : response.data;
  },

  getHistorial: async (mes: number, anio: number) =>
    (
      await httpClient.get<AsistenciaHistorialResponseDto[]>(
        `${BASE_URL}/mias/historial`,
        { params: { mes, anio } },
      )
    ).data,

  getDetallePropio: async (asistenciaId: number) =>
    (
      await httpClient.get<AsistenciaDetalleResponseDto>(
        `${BASE_URL}/mias/${asistenciaId}`,
      )
    ).data,
};
