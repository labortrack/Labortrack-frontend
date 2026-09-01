import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  EmpleadoBajaDto,
  EmpleadoDto,
  EmpleadoEstadoResponseDto,
  EmpleadoFilterParams,
  EmpleadoResponseDto,
  EmpleadoResumenResponseDto,
  EmpleadoUpdateDto,
  ReactivarLegajoRequestDto,
  SpringPage,
} from "../types/legajo.types";

export interface PresignedUrlResponse {
  url: string;
  nombreArchivo?: string;
  modo?: string;
}

export const legajosApi = {
  /**
   * GET /EmpleadosPaginados
   * Listado paginado de empleados con filtros opcionales.
   */
  getPaginados: async (
    params: EmpleadoFilterParams,
  ): Promise<SpringPage<EmpleadoResumenResponseDto>> => {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 0,
      size: params.size ?? 10,
      sort: params.sort || "usuario.apellido,asc",
    };

    if (params.buscar?.trim()) queryParams.buscar = params.buscar.trim();
    if (params.estado) queryParams.estado = params.estado;
    if (params.categoria) queryParams.categoria = params.categoria;

    const response = await httpClient.get<SpringPage<EmpleadoResumenResponseDto>>(
      "/legajos/EmpleadosPaginados",
      { params: queryParams },
    );
    return response.data;
  },

  /**
   * GET /ObtenerEmpleado/{id}
   * Detalle completo (Ficha 360°) de un empleado.
   */
  getDetalle: async (id: number): Promise<EmpleadoResponseDto> => {
    const response = await httpClient.get<EmpleadoResponseDto>(
      `/legajos/ObtenerEmpleado/${id}`,
    );
    return response.data;
  },

  /**
   * POST /altaEmpleado (multipart/form-data)
   * Alta de un nuevo legajo. Envía el DTO como Blob JSON bajo la clave "datos"
   * y el archivo de foto (opcional) bajo la clave "foto".
   */
  alta: async (datos: EmpleadoDto, foto?: File): Promise<EmpleadoResponseDto> => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(datos)], {
      type: "application/json",
    });
    formData.append("datos", jsonBlob);
    if (foto) {
      formData.append("foto", foto);
    }

    const response = await httpClient.post<EmpleadoResponseDto>(
      "/legajos/altaEmpleado",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  /**
   * PUT /ModificarEmpleado/{id}
   * Actualización parcial de datos del legajo (JSON).
   */
  modificar: async (
    id: number,
    payload: EmpleadoUpdateDto,
  ): Promise<EmpleadoResponseDto> => {
    const response = await httpClient.put<EmpleadoResponseDto>(
      `/legajos/ModificarEmpleado/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * PUT /{id}/foto (multipart/form-data)
   * Actualización de la foto de perfil del empleado.
   */
  actualizarFoto: async (id: number, foto: File): Promise<EmpleadoResponseDto> => {
    const formData = new FormData();
    formData.append("foto", foto);

    const response = await httpClient.put<EmpleadoResponseDto>(
      `/${id}/foto`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  /**
   * DELETE /BajaEmpleado/{id}
   * Registrar la baja de un empleado.
   */
  baja: async (
    id: number,
    payload: EmpleadoBajaDto,
  ): Promise<EmpleadoResponseDto> => {
    const response = await httpClient.delete<EmpleadoResponseDto>(
      `/legajos/BajaEmpleado/${id}`,
      { data: payload },
    );
    return response.data;
  },

  /**
   * PATCH /reactivarLegajo/{id}
   * Reactivar un legajo inactivo.
   */
  reactivar: async (
    id: number,
    payload: ReactivarLegajoRequestDto,
  ): Promise<EmpleadoResponseDto> => {
    const response = await httpClient.patch<EmpleadoResponseDto>(
      `/legajos/reactivarLegajo/${id}`,
      payload,
    );
    return response.data;
  },

  /**
   * GET /historial-estados/{id}
   * Historial de estados operativos/laborales de un empleado.
   */
  getHistorialEstados: async (
    id: number,
  ): Promise<EmpleadoEstadoResponseDto[]> => {
    const response = await httpClient.get<EmpleadoEstadoResponseDto[]>(
      `/legajos/historial-estados/${id}`,
    );
    return response.data;
  },

  /**
   * GET /empleados/{id}/foto-url
   * Obtiene una URL pre-firmada de MinIO para visualizar la foto de perfil.
   */
  getFotoPresignedUrl: async (id: number): Promise<PresignedUrlResponse> => {
    const response = await httpClient.get<PresignedUrlResponse>(
      `/api/v1/documentos/visualizarDocumento/${id}`,
    );
    return response.data;
  },
};
