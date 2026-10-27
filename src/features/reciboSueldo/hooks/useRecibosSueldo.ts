import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reciboSueldoApi } from "../api/reciboSueldoApi";
import type { ReciboSueldoDetalleDto } from "../types/reciboSueldo.types";
import { periodosLiquidacionKeys } from "@/features/periodoLiquidacion/hooks/usePeriodosLiquidacion";

export const recibosSueldoKeys = {
  all: ["recibosSueldo"] as const,
  periodo: (periodoId: number) =>
    [...recibosSueldoKeys.all, "periodo", periodoId] as const,
  detalle: (reciboId: number) =>
    [...recibosSueldoKeys.all, "detalle", reciboId] as const,
  propios: () => [...recibosSueldoKeys.all, "propios"] as const,
};

export function useDetalleRecibo(reciboId: number | null) {
  return useQuery({
    queryKey: recibosSueldoKeys.detalle(reciboId ?? 0),
    queryFn: () => reciboSueldoApi.obtenerDetalle(reciboId!),
    enabled: reciboId != null,
  });
}

/**
 * Trae todos los recibos del período: el filtro por estado se aplica en el cliente para
 * poder mostrar el conteo de cada estado sin una consulta por estado.
 */
export function useRecibosDelPeriodo(periodoId: number | null) {
  return useQuery({
    queryKey: recibosSueldoKeys.periodo(periodoId ?? 0),
    queryFn: () => reciboSueldoApi.listarDelPeriodo(periodoId!),
    enabled: periodoId != null,
  });
}

// ─── Ajustes sobre un recibo en BORRADOR ────────────────────────────────────

/**
 * Los endpoints de ajuste devuelven el detalle recalculado: se guarda directo en la caché y
 * se refresca la grilla, porque cambian los totales y, al cancelar, el estado.
 */
function useAjusteRecibo<TVariables>(
  reciboId: number,
  ajustar: (variables: TVariables) => Promise<ReciboSueldoDetalleDto>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ajustar,
    onSuccess: (detalle) => {
      queryClient.setQueryData(recibosSueldoKeys.detalle(reciboId), detalle);
      return queryClient.invalidateQueries({
        queryKey: [...recibosSueldoKeys.all, "periodo"],
      });
    },
  });
}

export function useAplicarConcepto(reciboId: number) {
  return useAjusteRecibo(reciboId, (conceptoId: number) =>
    reciboSueldoApi.aplicarConcepto(reciboId, conceptoId),
  );
}

export function useAplicarDeduccion(reciboId: number) {
  return useAjusteRecibo(reciboId, (deduccionId: number) =>
    reciboSueldoApi.aplicarDeduccion(reciboId, deduccionId),
  );
}

export function useQuitarLinea(reciboId: number) {
  return useAjusteRecibo(reciboId, (detalleId: number) =>
    reciboSueldoApi.quitarLinea(reciboId, detalleId),
  );
}

export function useRegenerarRecibo(reciboId: number) {
  return useAjusteRecibo(reciboId, () => reciboSueldoApi.regenerar(reciboId));
}

export function useCancelarRecibo(reciboId: number) {
  return useAjusteRecibo(reciboId, (motivo: string) =>
    reciboSueldoApi.cancelar(reciboId, motivo),
  );
}

export function useImprimirRecibo(reciboId: number) {
  return useAjusteRecibo(reciboId, () => reciboSueldoApi.imprimir(reciboId));
}

// ─── Acciones sobre el lote del período ─────────────────────────────────────

/**
 * Cambian el estado de muchos recibos a la vez (y la emisión, el del período): se refresca
 * todo lo de recibos y la lista de períodos.
 */
function useInvalidarLote() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: recibosSueldoKeys.all }),
      queryClient.invalidateQueries({ queryKey: periodosLiquidacionKeys.all }),
    ]);
}

/** BORRADOR → GENERADO para todo el lote, y el período pasa a CERRADO (RF055). */
export function useEmitirLote() {
  const invalidar = useInvalidarLote();
  return useMutation({
    mutationFn: (periodoId: number) => reciboSueldoApi.emitirLote(periodoId),
    onSuccess: invalidar,
  });
}

/** GENERADO → PENDIENTE_LECTURA, con el PDF de cada recibo (RF056). */
export function useImprimirLote() {
  const invalidar = useInvalidarLote();
  return useMutation({
    mutationFn: (periodoId: number) => reciboSueldoApi.imprimirLote(periodoId),
    onSuccess: invalidar,
  });
}

/** Cambia el estado del período (PENDIENTE → PRE_LIQUIDADO) y genera sus recibos. */
export function useEjecutarPreLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodoId: number) =>
      reciboSueldoApi.ejecutarPreLiquidacion(periodoId),
    onSuccess: (_resultado, periodoId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: periodosLiquidacionKeys.all }),
        queryClient.invalidateQueries({
          queryKey: recibosSueldoKeys.periodo(periodoId),
        }),
      ]),
  });
}

// ─── Autogestión del empleado ───────────────────────────────────────────────

export function useMisRecibos() {
  return useQuery({
    queryKey: recibosSueldoKeys.propios(),
    queryFn: () => reciboSueldoApi.listarPropios(),
  });
}

/** PENDIENTE_LECTURA → LEIDO (RF059). Abrir el PDF no cuenta como leído. */
export function useConfirmarLectura() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reciboId: number) => reciboSueldoApi.confirmarLectura(reciboId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: recibosSueldoKeys.propios() }),
  });
}

/** Genera los recibos que faltan en un período PRE_LIQUIDADO; el período no cambia de estado. */
export function useCompletarPreLiquidacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodoId: number) =>
      reciboSueldoApi.completarPreLiquidacion(periodoId),
    onSuccess: (_resultado, periodoId) =>
      queryClient.invalidateQueries({
        queryKey: recibosSueldoKeys.periodo(periodoId),
      }),
  });
}
