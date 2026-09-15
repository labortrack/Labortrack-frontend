import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  EmpleadoCategoriaRequestDto,
  EmpleadoCategoriaResponseDto,
} from "../types/empleadoCategoria.types";

const BASE_URL = "/labortrack/empleado-categoria";

export const empleadoCategoriaApi = {
  asignar: async (
    payload: EmpleadoCategoriaRequestDto,
  ): Promise<EmpleadoCategoriaResponseDto> => {
    const response = await httpClient.post<EmpleadoCategoriaResponseDto>(
      `${BASE_URL}/asignar`,
      payload,
    );
    return response.data;
  },

  obtenerHistorial: async (
    idEmpleado: number,
  ): Promise<EmpleadoCategoriaResponseDto[]> => {
    const response = await httpClient.get<EmpleadoCategoriaResponseDto[]>(
      `${BASE_URL}/historial/${idEmpleado}`,
    );
    return response.data;
  },
};
