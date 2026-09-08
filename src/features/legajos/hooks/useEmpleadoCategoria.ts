import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { empleadoCategoriaApi } from "../api/empleadoCategoriaApi";
import { legajosKeys } from "./useLegajos";
import type { EmpleadoCategoriaRequestDto } from "../types/empleadoCategoria.types";

export const empleadoCategoriaKeys = {
  historial: (idEmpleado: number) =>
    ["empleadoCategoria", "historial", idEmpleado] as const,
};

export function useHistorialCategoria(idEmpleado: number | null | undefined) {
  return useQuery({
    queryKey: empleadoCategoriaKeys.historial(idEmpleado ?? 0),
    queryFn: () => empleadoCategoriaApi.obtenerHistorial(idEmpleado!),
    enabled: Boolean(idEmpleado && idEmpleado > 0),
  });
}

export function useAsignarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmpleadoCategoriaRequestDto) =>
      empleadoCategoriaApi.asignar(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: empleadoCategoriaKeys.historial(variables.idEmpleado),
      });
      queryClient.invalidateQueries({
        queryKey: legajosKeys.detail(variables.idEmpleado),
      });
      queryClient.invalidateQueries({ queryKey: legajosKeys.lists() });
    },
  });
}
