import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  DashboardResumenResponseDto,
  TendenciaAsistenciaPuntoDto,
} from "../types/dashboard.types";

const BASE_URL = "/api/dashboard";

export const dashboardApi = {
  getResumen: async () => {
    const response = await httpClient.get<DashboardResumenResponseDto>(
      `${BASE_URL}/resumen`
    );
    return response.data;
  },

  getTendenciaAsistencia: async (fechaDesde: string, fechaHasta: string) => {
    const response = await httpClient.get<TendenciaAsistenciaPuntoDto[]>(
      `${BASE_URL}/tendencia-asistencia`,
      { params: { fechaDesde, fechaHasta } }
    );
    return response.data;
  },
};
