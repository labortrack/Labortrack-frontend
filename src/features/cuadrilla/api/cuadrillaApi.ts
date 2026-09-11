import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  AltaCuadrillaRequestDto,
  AltaEmpleadoGrupoCuadrillaRequestDto,
  BajaEmpleadoGrupoCuadrillaRequestDto,
  CuadrillaResponseDto,
  EmpleadoGrupoCuadrillaResponseDto,
  GrupoResponseDto,
  LiderCuadrillaRequestDto,
  ModificarCuadrillaRequestDto,
  SpringPage,
} from "../types/cuadrilla.types";

const BASE_URL = "/api/cuadrilla";

export const cuadrillaApi = {
  // Obtener cuadrillas de una obra (paginado)
  getByObraId: async (obraId: number, page = 0, size = 20) => {
    const response = await httpClient.get<SpringPage<CuadrillaResponseDto>>(
      `${BASE_URL}/obra/${obraId}`,
      {
        params: { page, size, sort: "nombre,asc" },
      }
    );
    return response.data;
  },

  // Obtener detalle de una cuadrilla
  getById: async (cuadrillaId: number) => {
    const response = await httpClient.get<CuadrillaResponseDto>(
      `${BASE_URL}/${cuadrillaId}`
    );
    return response.data;
  },

  // Crear nueva cuadrilla
  create: async (payload: AltaCuadrillaRequestDto) => {
    const response = await httpClient.post<CuadrillaResponseDto>(
      `${BASE_URL}/crear`,
      payload
    );
    return response.data;
  },

  // Modificar cuadrilla
  modify: async (cuadrillaId: number, payload: ModificarCuadrillaRequestDto) => {
    const response = await httpClient.patch<CuadrillaResponseDto>(
      `${BASE_URL}/modificar/${cuadrillaId}`,
      payload
    );
    return response.data;
  },

  // Asignar líder
  asignarLider: async (payload: LiderCuadrillaRequestDto) => {
    const response = await httpClient.patch<CuadrillaResponseDto>(
      `${BASE_URL}/asignar-lider`,
      payload
    );
    return response.data;
  },

  // Baja de cuadrilla (transiciona a SUSPENDIDA)
  baja: async (cuadrillaId: number) => {
    const response = await httpClient.delete<CuadrillaResponseDto>(
      `${BASE_URL}/${cuadrillaId}`
    );
    return response.data;
  },

  // Reactivar cuadrilla (transiciona a PLANIFICADA)
  reactivar: async (cuadrillaId: number) => {
    const response = await httpClient.patch<CuadrillaResponseDto>(
      `${BASE_URL}/reactivar/${cuadrillaId}`
    );
    return response.data;
  },

  // Obtener nómina de operarios vigentes de la cuadrilla
  getOperarios: async (cuadrillaId: number) => {
    const response = await httpClient.get<EmpleadoGrupoCuadrillaResponseDto[]>(
      `${BASE_URL}/empleado/cuadrilla/${cuadrillaId}`
    );
    return response.data;
  },

  // Asignar operario a la cuadrilla
  asignarOperario: async (payload: AltaEmpleadoGrupoCuadrillaRequestDto) => {
    const response = await httpClient.post<EmpleadoGrupoCuadrillaResponseDto>(
      `${BASE_URL}/empleado/crear`,
      payload
    );
    return response.data;
  },

  // Desvincular operario de la cuadrilla
  bajaOperario: async (
    idEmpleadoGrupoCuadrilla: number,
    payload: BajaEmpleadoGrupoCuadrillaRequestDto
  ) => {
    const response = await httpClient.delete<EmpleadoGrupoCuadrillaResponseDto>(
      `${BASE_URL}/empleado/baja/${idEmpleadoGrupoCuadrilla}`,
      { data: payload }
    );
    return response.data;
  },

  // Listar grupos / especialidades disponibles
  getGrupos: async (page = 0, size = 50) => {
    const response = await httpClient.get<SpringPage<GrupoResponseDto>>(
      "/labortrack/grupo",
      {
        params: { page, size },
      }
    );
    return response.data;
  },
};
