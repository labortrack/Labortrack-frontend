import { axiosClient } from "@/api/axiosClient";
import type {
  UserResponseDto,
  CreateUsuarioRequestDto,
  ModifyUserRequestDto,
  UsuarioBajaDto,
  UsuarioFilterDto,
  SpringPage,
  PageableParams,
} from "../types/usuario.types";

export const usuarioApi = {
  /**
   * Obtiene la lista completa de usuarios sin paginar
   * GET /api/usuario
   */
  findAll: async (): Promise<UserResponseDto[]> => {
    const { data } = await axiosClient.get<UserResponseDto[]>("/api/usuario");
    return data;
  },

  /**
   * Obtiene usuarios aplicando filtros y paginación de Spring Data
   * GET /api/usuario/filter
   */
  findByFilter: async (
    filter: UsuarioFilterDto,
    pageable: PageableParams = { page: 0, size: 10, sort: "apellido,asc" },
  ): Promise<SpringPage<UserResponseDto>> => {
    const params = {
      ...(filter.nombre && { nombre: filter.nombre }),
      ...(filter.apellido && { apellido: filter.apellido }),
      ...(filter.email && { email: filter.email }),
      ...(filter.rol && { rol: filter.rol }),
      ...(filter.enabled !== undefined && { enabled: filter.enabled }),
      page: pageable.page ?? 0,
      size: pageable.size ?? 10,
      sort: pageable.sort ?? "apellido,asc",
    };

    const { data } = await axiosClient.get<SpringPage<UserResponseDto>>(
      "/api/usuario/filter",
      { params },
    );
    return data;
  },

  /**
   * Busca un usuario por su ID
   * GET /api/usuario/{idUser}
   */
  findById: async (idUser: number): Promise<UserResponseDto> => {
    const { data } = await axiosClient.get<UserResponseDto>(
      `/api/usuario/${idUser}`,
    );
    return data;
  },

  /**
   * Da de alta un nuevo usuario
   * POST /api/usuario
   */
  create: async (dto: CreateUsuarioRequestDto): Promise<UserResponseDto> => {
    const { data } = await axiosClient.post<UserResponseDto>(
      "/api/usuario",
      dto,
    );
    return data;
  },

  /**
   * Modifica nombre y apellido del usuario
   * PATCH /api/usuario/{idUser}
   */
  modify: async (
    idUser: number,
    dto: ModifyUserRequestDto,
  ): Promise<UserResponseDto> => {
    const { data } = await axiosClient.patch<UserResponseDto>(
      `/api/usuario/${idUser}`,
      dto,
    );
    return data;
  },

  /**
   * Da de baja lógica al usuario indicando el motivo
   * DELETE /api/usuario/{idUser}
   * Nota: En Axios, el body de un método DELETE se envía dentro de config.data
   */
  deleteById: async (
    idUser: number,
    dto: UsuarioBajaDto,
  ): Promise<UserResponseDto> => {
    const { data } = await axiosClient.delete<UserResponseDto>(
      `/api/usuario/${idUser}`,
      {
        data: dto,
      },
    );
    return data;
  },

  /**
   * Endpoint de prueba protegido por ROLE_ADMIN
   * GET /api/usuario/hi
   */
  hi: async (): Promise<string> => {
    const { data } = await axiosClient.get<string>("/api/usuario/hi");
    return data;
  },
};
