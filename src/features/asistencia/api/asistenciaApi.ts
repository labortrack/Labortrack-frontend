import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  AsistenciaDetalleResponseDto,
  AsistenciaHistorialResponseDto,
  AsistenciaHoyResponseDto,
  CapacidadesAsistenciaResponseDto,
  PeriodoDisponibleAsistenciaResponseDto,
} from "../types/asistencia.types";
import type { SpringPage } from "@/shared/types/pagination.types";

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

  getHistorial: async (
    mes: number,
    anio: number,
    page: number,
    size: number,
  ) =>
    (
      await httpClient.get<SpringPage<AsistenciaHistorialResponseDto>>(
        `${BASE_URL}/mias/historial`,
        { params: { mes, anio, page, size } },
      )
    ).data,

  getPeriodoDisponible: async () =>
    (
      await httpClient.get<PeriodoDisponibleAsistenciaResponseDto>(
        `${BASE_URL}/mias/periodo-disponible`,
      )
    ).data,

  getDetallePropio: async (asistenciaId: number) =>
    (
      await httpClient.get<AsistenciaDetalleResponseDto>(
        `${BASE_URL}/mias/${asistenciaId}`,
      )
    ).data,
};
