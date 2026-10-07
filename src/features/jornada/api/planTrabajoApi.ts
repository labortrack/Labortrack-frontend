import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  ConsultaPlanesTrabajoResponseDto,
  CerrarPlanTrabajoRequestDto,
  CerrarPlanTrabajoResponseDto,
  CrearJornadaExtraordinariaRequestDto,
  CrearJornadaExtraordinariaResponseDto,
  CrearPlanTrabajoRequestDto,
  JornadaPlanFiltros,
  ModificarPlanTrabajoRequestDto,
  ModificarPlanTrabajoResponseDto,
  PlanTrabajoCuadrillaResponseDto,
  PlanTrabajoDetalleResponseDto,
  PlanTrabajoFiltros,
} from "../types/planTrabajo.types";

const baseUrl = (cuadrillaId: number) =>
  `/api/cuadrillas/${cuadrillaId}/planes-trabajo`;

export const planTrabajoApi = {
  crear: async (
    cuadrillaId: number,
    payload: CrearPlanTrabajoRequestDto,
  ) => {
    const response = await httpClient.post<PlanTrabajoCuadrillaResponseDto>(
      baseUrl(cuadrillaId),
      payload,
    );
    return response.data;
  },

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

  modificar: async (
    cuadrillaId: number,
    planId: number,
    payload: ModificarPlanTrabajoRequestDto,
  ) => {
    const response = await httpClient.put<ModificarPlanTrabajoResponseDto>(
      `${baseUrl(cuadrillaId)}/${planId}`,
      payload,
    );
    return response.data;
  },

  crearJornadaExtraordinaria: async (
    cuadrillaId: number,
    planId: number,
    payload: CrearJornadaExtraordinariaRequestDto,
  ) => {
    const response =
      await httpClient.post<CrearJornadaExtraordinariaResponseDto>(
        `${baseUrl(cuadrillaId)}/${planId}/jornadas-extraordinarias`,
        payload,
      );
    return response.data;
  },

  cancelar: async (
    cuadrillaId: number,
    planId: number,
    payload: CerrarPlanTrabajoRequestDto,
  ) => {
    const response = await httpClient.patch<CerrarPlanTrabajoResponseDto>(
      `${baseUrl(cuadrillaId)}/${planId}/cancelacion`,
      payload,
    );
    return response.data;
  },

  finalizarAnticipadamente: async (
    cuadrillaId: number,
    planId: number,
    payload: CerrarPlanTrabajoRequestDto,
  ) => {
    const response = await httpClient.patch<CerrarPlanTrabajoResponseDto>(
      `${baseUrl(cuadrillaId)}/${planId}/finalizacion-anticipada`,
      payload,
    );
    return response.data;
  },
};
