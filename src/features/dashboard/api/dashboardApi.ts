import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  DashboardResumenResponseDto,
  LecturaRecibosPeriodoDto,
  TendenciaAsistenciaPuntoDto,
} from "../types/dashboard.types";

const BASE_URL = "/api/dashboard";

export const dashboardApi = {
  getResumen: async (obraId?: number) => {
    const response = await httpClient.get<DashboardResumenResponseDto>(
      `${BASE_URL}/resumen`,
      { params: { obraId } }
    );
    return response.data;
  },

  getTendenciaAsistencia: async (fechaDesde: string, fechaHasta: string, obraId?: number) => {
    const response = await httpClient.get<TendenciaAsistenciaPuntoDto[]>(
      `${BASE_URL}/tendencia-asistencia`,
      { params: { fechaDesde, fechaHasta, obraId } }
    );
    return response.data;
  },

  getLecturaRecibos: async (meses: number) => {
    const response = await httpClient.get<LecturaRecibosPeriodoDto[]>(
      `${BASE_URL}/lectura-recibos`,
      { params: { meses } }
    );
    return response.data;
  },
};
