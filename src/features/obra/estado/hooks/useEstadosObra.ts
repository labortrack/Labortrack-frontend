import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { estadoObraApi } from "../api/estadoObraApi";
import type {
  CreateEstadoObraDto,
  ModifyEstadoObraRequestDto,
  TabFiltroEstadoObra,
} from "../types/estadoObra.types";

export const estadosObraKeys = {
  all: ["estadosObra"] as const,
  list: (filtro: TabFiltroEstadoObra) =>
    ["estadosObra", "list", filtro] as const,
  activos: ["estadosObra", "activos"] as const,
};

export function useEstadosObra(filtro: TabFiltroEstadoObra = "Activos") {
  return useQuery({
    queryKey: estadosObraKeys.list(filtro),
    queryFn: async () => {
      if (filtro === "Activos") {
        return estadoObraApi.getActive();
      }
      if (filtro === "Inactivos") {
        return estadoObraApi.getInactive();
      }
      return estadoObraApi.getAll();
    },
    placeholderData: keepPreviousData,
  });
}

export function useEstadosObraActivos() {
  return useQuery({
    queryKey: estadosObraKeys.activos,
    queryFn: () => estadoObraApi.getActive(),
  });
}

function useInvalidateEstadosObra() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: estadosObraKeys.all });
}

export function useCreateEstadoObra() {
  const invalidate = useInvalidateEstadosObra();
  return useMutation({
    mutationFn: (payload: CreateEstadoObraDto) =>
      estadoObraApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useModifyEstadoObra() {
  const invalidate = useInvalidateEstadosObra();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ModifyEstadoObraRequestDto;
    }) => estadoObraApi.modify(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteEstadoObra() {
  const invalidate = useInvalidateEstadosObra();
  return useMutation({
    mutationFn: (id: number) => estadoObraApi.delete(id),
    onSuccess: invalidate,
  });
}
