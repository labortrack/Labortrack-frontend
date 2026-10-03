import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  ConsultaPlanesTrabajoResponseDto,
  JornadaPlanFiltros,
  PlanTrabajoDetalleResponseDto,
  PlanTrabajoFiltros,
} from "../types/planTrabajo.types";

const baseUrl = (cuadrillaId: number) =>
  `/api/cuadrillas/${cuadrillaId}/planes-trabajo`;

export const planTrabajoApi = {
  listar: async (cuadrillaId: number, filtros: PlanTrabajoFiltros) => {
    const response = await httpClient.get<ConsultaPlanesTrabajoResponseDto>(
      baseUrl(cuadrillaId),
      {
        params: {
          ...filtros,
          page: filtros.page ?? 0,
          size: filtros.size ?? 10,
          sort: "fechaVigenciaDesde,desc",
        },
      },
    );
    return response.data;
  },

  obtenerDetalle: async (
    cuadrillaId: number,
    planId: number,
    filtros: JornadaPlanFiltros,
  ) => {
    const response = await httpClient.get<PlanTrabajoDetalleResponseDto>(
      `${baseUrl(cuadrillaId)}/${planId}`,
      {
        params: {
          ...filtros,
          page: filtros.page ?? 0,
          size: filtros.size ?? 20,
          sort: "fechaJornadaTrabajo,asc",
        },
      },
    );
    return response.data;
  },
};
