import { useEffect, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { documentacionApi } from "../api/documentacionApi";
import type { DocumentoFilterDto } from "../types/documentacion.types";
import type { PageableParams } from "@/shared/types/pagination.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const documentacionKeys = {
  /** Raíz para todos los tipos de documento. */
  tiposAll: ["tipos-documento"] as const,
  tiposList: (page: number, size: number) =>
    ["tipos-documento", "list", page, size] as const,

  /** Raíz para todos los documentos. */
  documentosAll: ["documentos"] as const,
  documentosList: (
    filters: DocumentoFilterDto,
    page: number,
    size: number,
  ) => ["documentos", "list", filters, page, size] as const,
};

// ─── Helpers de invalidación ──────────────────────────────────────────────────

function useInvalidateTipos() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: documentacionKeys.tiposAll });
}

function useInvalidateDocumentos() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: documentacionKeys.documentosAll });
}

// ─── Hooks de Tipos de Documento ──────────────────────────────────────────────

/**
 * Listado de Tipos de Documento.
 * Usado para la tabla de administración del parámetro.
 */
export function useTiposDocumento() {
  return useQuery({
    queryKey: documentacionKeys.tiposAll,
    queryFn: () => documentacionApi.listarTiposDocumento(),
    placeholderData: keepPreviousData,
  });
}

/**
 * Listado completo (sin paginación) de Tipos de Documento.
 * Ideal para poblar Selects en formularios.
 */
export function useTiposDocumentoCompleto() {
  return useQuery({
    queryKey: [...documentacionKeys.tiposAll, "completo"],
    queryFn: () => documentacionApi.listadoCompletoTiposDocumento(),
    staleTime: 5 * 60 * 1000, // 5 min — los tipos cambian poco
  });
}

export function useCrearTipoDocumento() {
  const invalidate = useInvalidateTipos();
  return useMutation({
    mutationFn: documentacionApi.crearTipoDocumento,
    onSuccess: invalidate,
  });
}

export function useModificarTipoDocumento() {
  const invalidate = useInvalidateTipos();
  return useMutation({
    mutationFn: ({
      id,
      data,
      payload,
    }: {
      id: number;
      data?: Parameters<typeof documentacionApi.modificarTipoDocumento>[1];
      payload?: Parameters<typeof documentacionApi.modificarTipoDocumento>[1];
    }) => documentacionApi.modificarTipoDocumento(id, (data ?? payload)!),
    onSuccess: invalidate,
  });
}


export function useBajaTipoDocumento() {
  const invalidate = useInvalidateTipos();
  return useMutation({
    mutationFn: (id: number) => documentacionApi.bajaTipoDocumento(id),
    onSuccess: invalidate,
  });
}

export function useReactivarTipoDocumento() {
  const invalidate = useInvalidateTipos();
  return useMutation({
    mutationFn: (id: number) => documentacionApi.reactivarTipoDocumento(id),
    onSuccess: invalidate,
  });
}

// ─── Hooks de Documentos ──────────────────────────────────────────────────────

/**
 * Listado paginado de Documentos con filtros opcionales.
 */
export function useListarDocumentos(
  filters: DocumentoFilterDto,
  page = 0,
  size = 10,
  pageable?: Partial<PageableParams>,
) {
  return useQuery({
    queryKey: documentacionKeys.documentosList(filters, page, size),
    queryFn: () =>
      documentacionApi.listarDocumentos(filters, {
        page,
        size,
        sort: pageable?.sort ?? "fechaSubida,desc",
      }),
    placeholderData: keepPreviousData,
  });
}

/**
 * Mutation para subir un documento.
 * Invalida la caché de ['documentos'] al completar con éxito.
 */
export function useUploadDocumento() {
  const invalidate = useInvalidateDocumentos();
  return useMutation({
    mutationFn: documentacionApi.uploadDocumento,
    onSuccess: invalidate,
  });
}

/**
 * Mutation para dar de baja un documento.
 * Invalida la caché de ['documentos'] al completar con éxito.
 */
export function useBajaDocumento() {
  const invalidate = useInvalidateDocumentos();
  return useMutation({
    mutationFn: (id: number) => documentacionApi.bajaDocumentacion(id),
    onSuccess: invalidate,
  });
}

export function useReactivarDocumento() {
  const invalidate = useInvalidateDocumentos();
  return useMutation({
    mutationFn: (id: number) => documentacionApi.reactivarDocumento(id),
    onSuccess: invalidate,
  });
}

/**
 * Mutation (Lazy Query) para obtener el string de URL prefirmada de visualización
 * de un documento específico bajo demanda al hacer clic en "Abrir Visor".
 */
export function useObtenerUrlVisor() {
  return useMutation({
    mutationFn: (id: number) => documentacionApi.obtenerUrlVisor(id),
  });
}


// ─── Hook: Búsqueda de empleados con debounce ──────────────────────────────────


/**
 * Busca empleados por nombre/apellido con 300 ms de debounce.
 * Solo dispara la consulta cuando `buscar` tiene al menos 1 carácter.
 * Ideal para poblar el combobox de "Empleado Asociado" en el formulario de subida.
 */
export function useBuscarEmpleados(buscar: string) {
  const [debouncedBuscar, setDebouncedBuscar] = useState(buscar);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBuscar(buscar), 300);
    return () => clearTimeout(timer);
  }, [buscar]);

  return useQuery({
    queryKey: ["empleados", "buscar", debouncedBuscar],
    queryFn: () => documentacionApi.buscarEmpleados(debouncedBuscar),
    enabled: debouncedBuscar.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
