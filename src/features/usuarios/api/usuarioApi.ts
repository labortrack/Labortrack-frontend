import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  CreateUsuarioRequestDto,
  ModifyUserRequestDto,
  PageableParams,
  SpringPage,
  UserResponseDto,
  UsuarioBajaDto,
  UsuarioFilterDto,
} from "../types/usuario.types";

function cleanFilters(filter: UsuarioFilterDto) {
  return Object.fromEntries(
    Object.entries(filter).filter(
      ([, value]) => value !== "" && value !== undefined,
    ),
  );
}

export const usuarioApi = {
  findByFilter: async (filter: UsuarioFilterDto, pageable: PageableParams) =>
    (
      await httpClient.get<SpringPage<UserResponseDto>>("/api/usuario/filter", {
        params: { ...cleanFilters(filter), ...pageable },
      })
    ).data,
  create: async (payload: CreateUsuarioRequestDto) =>
    (await httpClient.post<UserResponseDto>("/api/usuario", payload)).data,
  modify: async (id: number, payload: ModifyUserRequestDto) =>
    (await httpClient.patch<UserResponseDto>(`/api/usuario/${id}`, payload))
      .data,
  deactivate: async (id: number, payload: UsuarioBajaDto) =>
    (
      await httpClient.delete<UserResponseDto>(`/api/usuario/${id}`, {
        data: payload,
      })
    ).data,
};
