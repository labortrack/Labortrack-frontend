import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usuarioApi } from "../api/usuarioApi";
import type {
  CreateUsuarioRequestDto,
  ModifyUserRequestDto,
  UsuarioBajaDto,
  UsuarioFilterDto,
} from "../types/usuario.types";

export const usuariosKeys = {
  all: ["usuarios"] as const,
  list: (filters: UsuarioFilterDto, page: number, size: number) =>
    ["usuarios", "list", filters, page, size] as const,
};

export function useUsuarios(
  filters: UsuarioFilterDto,
  page: number,
  size = 10,
) {
  return useQuery({
    queryKey: usuariosKeys.list(filters, page, size),
    queryFn: () =>
      usuarioApi.findByFilter(filters, { page, size, sort: "apellido,asc" }),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateUsuarios() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
}

export function useCreateUsuario() {
  const invalidate = useInvalidateUsuarios();
  return useMutation({
    mutationFn: (payload: CreateUsuarioRequestDto) =>
      usuarioApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useModifyUsuario() {
  const invalidate = useInvalidateUsuarios();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ModifyUserRequestDto;
    }) => usuarioApi.modify(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeactivateUsuario() {
  const invalidate = useInvalidateUsuarios();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UsuarioBajaDto }) =>
      usuarioApi.deactivate(id, payload),
    onSuccess: invalidate,
  });
}
