import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { legajosApi } from "@/features/legajos/api/legajosApi";
import { estructuraLaboralApi } from "../api/estructuraLaboralApi";
import type {
  EmpleadoGrupoFilterDto,
  EmpleadoGrupoRequestDto,
  GrupoFilterDto,
  GrupoRequestDto,
} from "../types/estructuraLaboral.types";

export const estructuraLaboralKeys = {
  all: ["estructuraLaboral"] as const,
  grupos: (filter?: GrupoFilterDto) =>
    [...estructuraLaboralKeys.all, "grupos", filter] as const,
  asignaciones: (filter?: EmpleadoGrupoFilterDto) =>
    [...estructuraLaboralKeys.all, "asignaciones", filter] as const,
  empleadosActivos: () =>
    [...estructuraLaboralKeys.all, "empleadosActivos"] as const,
};

export function useGruposList(filter?: GrupoFilterDto) {
  return useQuery({
    queryKey: estructuraLaboralKeys.grupos(filter),
    queryFn: () => estructuraLaboralApi.getGrupos(filter, 0, 100),
  });
}

export function useCreateGrupo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GrupoRequestDto) =>
      estructuraLaboralApi.crearGrupo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: estructuraLaboralKeys.all,
      });
    },
  });
}

export function useUpdateGrupo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GrupoRequestDto }) =>
      estructuraLaboralApi.modificarGrupo(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: estructuraLaboralKeys.all,
      });
    },
  });
}

export function useDeleteGrupo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => estructuraLaboralApi.eliminarGrupo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: estructuraLaboralKeys.all,
      });
    },
  });
}

export function useEmpleadoGruposList(filter?: EmpleadoGrupoFilterDto) {
  return useQuery({
    queryKey: estructuraLaboralKeys.asignaciones(filter),
    queryFn: () => estructuraLaboralApi.getEmpleadoGrupos(filter, 0, 100),
  });
}

export function useCreateEmpleadoGrupo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmpleadoGrupoRequestDto) =>
      estructuraLaboralApi.crearEmpleadoGrupo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: estructuraLaboralKeys.all,
      });
    },
  });
}

export function useFinalizarEmpleadoGrupo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      estructuraLaboralApi.finalizarEmpleadoGrupo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: estructuraLaboralKeys.all,
      });
    },
  });
}

export function useEmpleadosActivos() {
  return useQuery({
    queryKey: estructuraLaboralKeys.empleadosActivos(),
    queryFn: () =>
      legajosApi.getPaginados({
        estado: "ACTIVO",
        size: 100,
        sort: "usuario.apellido,asc",
      }),
  });
}

export function useEmpleadosPorGrupo(
  idGrupo: number | null | undefined,
  filter?: EmpleadoGrupoFilterDto
) {
  return useQuery({
    queryKey: [...estructuraLaboralKeys.all, "porGrupo", idGrupo, filter] as const,
    queryFn: () =>
      estructuraLaboralApi.getEmpleadoGruposPorGrupo(idGrupo!, filter, 0, 100),
    enabled: Boolean(idGrupo),
  });
}
