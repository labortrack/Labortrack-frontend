import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { obraApi } from "../api/obraApi";
import type {
  BajaObraRequestDto,
  CreateObraDto,
  ModifyObraRequestDto,
  TransicionarEstadoObraDto,
} from "../types/obra.types";

export const obrasKeys = {
  all: ["obras"] as const,
  lists: () => [...obrasKeys.all, "list"] as const,
  list: (nomenclatura?: string) =>
    [...obrasKeys.all, "list", { nomenclatura: nomenclatura?.trim() || "" }] as const,
  byNomenclatura: (valor: string) =>
    [...obrasKeys.all, "byNomenclatura", valor.trim()] as const,
  detail: (id: number) => [...obrasKeys.all, "detail", id] as const,
  historial: (id: number) => [...obrasKeys.all, "historial", id] as const,
  qrConfig: (id: number) => [...obrasKeys.all, "qr-config", id] as const,
  qr: (id: number) => [...obrasKeys.all, "qr", id] as const,
};

export function useObras(nomenclatura?: string) {
  return useQuery({
    queryKey: obrasKeys.list(nomenclatura),
    queryFn: () => obraApi.getAll(nomenclatura),
    placeholderData: keepPreviousData,
  });
}

export function useObraPorNomenclatura(valor: string | null | undefined) {
  return useQuery({
    queryKey: obrasKeys.byNomenclatura(valor ?? ""),
    queryFn: () => obraApi.getByNomenclatura(valor!),
    enabled: Boolean(valor?.trim()),
  });
}

export function useObra(id: number | null | undefined) {
  return useQuery({
    queryKey: obrasKeys.detail(id ?? 0),
    queryFn: () => obraApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useHistorialEstadosObra(id: number | null | undefined) {
  return useQuery({
    queryKey: obrasKeys.historial(id ?? 0),
    queryFn: () => obraApi.getHistorialEstados(id!),
    enabled: Boolean(id),
  });
}

export function useAsegurarQrObra(id: number | null | undefined) {
  return useQuery({
    queryKey: obrasKeys.qrConfig(id ?? 0),
    queryFn: async () => {
      await obraApi.asegurarQr(id!);
      return true;
    },
    enabled: Boolean(id),
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });
}

export function useQrObra(
  id: number | null | undefined,
  configuracionLista: boolean,
) {
  return useQuery({
    queryKey: obrasKeys.qr(id ?? 0),
    queryFn: () => obraApi.generarQr(id!),
    enabled: Boolean(id) && configuracionLista,
    refetchInterval: (query) => {
      const venceEn = query.state.data?.venceEn;
      if (!venceEn) return false;

      const hastaRenovacion = Date.parse(venceEn) - Date.now() - 30_000;
      return Math.max(hastaRenovacion, 1_000);
    },
    refetchIntervalInBackground: true,
    retry: 2,
  });
}

function useInvalidateObras() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: obrasKeys.all });
}

export function useCreateObra() {
  const invalidate = useInvalidateObras();
  return useMutation({
    mutationFn: (payload: CreateObraDto) => obraApi.create(payload),
    onSuccess: invalidate,
  });
}

export function useModifyObra() {
  const invalidate = useInvalidateObras();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ModifyObraRequestDto;
    }) => obraApi.modify(id, payload),
    onSuccess: invalidate,
  });
}

export function useBajaObra() {
  const invalidate = useInvalidateObras();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: BajaObraRequestDto;
    }) => obraApi.baja(id, payload),
    onSuccess: invalidate,
  });
}

export function useCambiarEstadoObra() {
  const invalidate = useInvalidateObras();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: TransicionarEstadoObraDto;
    }) => obraApi.cambiarEstado(id, payload),
    onSuccess: invalidate,
  });
}
