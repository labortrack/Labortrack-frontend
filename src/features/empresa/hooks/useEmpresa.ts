import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { empresaApi } from "../api/empresaApi";
import type {
  EmpresaDto,
  EmpresaModificacionDto,
} from "../types/empresa.types";

export const empresaKeys = {
  all: ["empresa"] as const,
  detail: () => [...empresaKeys.all, "detail"] as const,
  inicializada: () => [...empresaKeys.all, "inicializada"] as const,
};

// retry:false porque un 404 acá significa "todavía no se inicializó la empresa"
// (RF016), no una falla transitoria de red.
export function useEmpresa() {
  return useQuery({
    queryKey: empresaKeys.detail(),
    queryFn: empresaApi.obtener,
    retry: false,
  });
}

export function useEmpresaInicializada() {
  return useQuery({
    queryKey: empresaKeys.inicializada(),
    queryFn: empresaApi.inicializada,
  });
}

export function useInicializarEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      logotipo,
    }: {
      dto: EmpresaDto;
      logotipo?: File | null;
    }) => empresaApi.inicializar(dto, logotipo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: empresaKeys.all });
    },
  });
}

export function useModificarEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dto,
      logotipo,
    }: {
      dto: EmpresaModificacionDto;
      logotipo?: File | null;
    }) => empresaApi.modificar(dto, logotipo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: empresaKeys.all });
    },
  });
}
