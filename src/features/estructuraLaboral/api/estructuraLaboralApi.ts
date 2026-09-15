import { httpClient } from "@/shared/lib/http/httpClient";
import type { SpringPage } from "@/shared/types/pagination.types";
import type {
  EmpleadoGrupoFilterDto,
  EmpleadoGrupoRequestDto,
  EmpleadoGrupoResponseDto,
  GrupoFilterDto,
  GrupoRequestDto,
  GrupoResponseDto,
} from "../types/estructuraLaboral.types";

export const estructuraLaboralApi = {
  // ── Grupos ──
  getGrupos: async (filter?: GrupoFilterDto, page = 0, size = 50) => {
    const params: Record<string, unknown> = { page, size };
    if (filter?.tipoActividad) params.tipoActividad = filter.tipoActividad;
    if (filter?.activo !== undefined) params.activo = filter.activo;

    const response = await httpClient.get<SpringPage<GrupoResponseDto>>(
      "/labortrack/grupo",
      { params }
    );
    return response.data;
  },

  crearGrupo: async (payload: GrupoRequestDto) => {
    const response = await httpClient.post<GrupoResponseDto>(
      "/labortrack/grupo/crear",
      payload
    );
    return response.data;
  },

  modificarGrupo: async (id: number, payload: GrupoRequestDto) => {
    const response = await httpClient.patch<GrupoResponseDto>(
      `/labortrack/grupo/modificar/${id}`,
      payload
    );
    return response.data;
  },

  eliminarGrupo: async (id: number) => {
    const response = await httpClient.delete<GrupoResponseDto>(
      `/labortrack/grupo/eliminar/${id}`
    );
    return response.data;
  },

  // ── Empleado Grupo (Asignaciones) ──
  getEmpleadoGrupos: async (
    filter?: EmpleadoGrupoFilterDto,
    page = 0,
    size = 100
  ) => {
    const params: Record<string, unknown> = { page, size };
    if (filter?.idGrupo) params.idGrupo = filter.idGrupo;
    if (filter?.busqueda) params.busqueda = filter.busqueda;
    if (filter?.activo !== undefined) params.activo = filter.activo;

    const response = await httpClient.get<SpringPage<EmpleadoGrupoResponseDto>>(
      "/labortrack/empleado-grupo",
      { params }
    );
    return response.data;
  },

  getEmpleadoGruposPorGrupo: async (
    idGrupo: number,
    filter?: EmpleadoGrupoFilterDto,
    page = 0,
    size = 100
  ) => {
    const params: Record<string, unknown> = { page, size };
    if (filter?.busqueda) params.busqueda = filter.busqueda;
    if (filter?.activo !== undefined) params.activo = filter.activo;

    const response = await httpClient.get<SpringPage<EmpleadoGrupoResponseDto>>(
      `/labortrack/empleado-grupo/grupo/${idGrupo}`,
      { params }
    );
    return response.data;
  },

  crearEmpleadoGrupo: async (payload: EmpleadoGrupoRequestDto) => {
    const response = await httpClient.post<EmpleadoGrupoResponseDto>(
      "/labortrack/empleado-grupo/crear",
      payload
    );
    return response.data;
  },

  finalizarEmpleadoGrupo: async (id: number) => {
    const response = await httpClient.delete<EmpleadoGrupoResponseDto>(
      `/labortrack/empleado-grupo/eliminar/${id}`
    );
    return response.data;
  },
};
