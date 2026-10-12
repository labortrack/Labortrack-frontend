import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  enviarAvisoGlobal,
  getCantidadNoLeidas,
  getConfiguracionNotificaciones,
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  modificarConfiguracionNotificacion,
} from "../api/notificaciones.api";
import type {
  ConfiguracionNotificacionDto,
  TipoNotificacion,
} from "../types/notificaciones.types";

/** Intervalo de consulta del contador de no leídas. */
const INTERVALO_POLLING_MS = 60_000;

export const notificacionesKeys = {
  all: ["notificaciones"] as const,
  listas: () => [...notificacionesKeys.all, "lista"] as const,
  lista: (page: number, size: number, soloNoLeidas: boolean) =>
    [...notificacionesKeys.listas(), { page, size, soloNoLeidas }] as const,
  cantidadNoLeidas: () => [...notificacionesKeys.all, "no-leidas"] as const,
  configuracion: () => [...notificacionesKeys.all, "configuracion"] as const,
};

/**
 * Contador de no leídas. Se consulta periódicamente mientras la pestaña está visible.
 */
export function useCantidadNoLeidas() {
  return useQuery({
    queryKey: notificacionesKeys.cantidadNoLeidas(),
    queryFn: getCantidadNoLeidas,
    refetchInterval: INTERVALO_POLLING_MS,
    refetchOnWindowFocus: true,
    select: (data) => data.cantidad,
  });
}

export function useNotificaciones(
  page: number,
  size: number,
  soloNoLeidas = false,
  enabled = true,
) {
  return useQuery({
    queryKey: notificacionesKeys.lista(page, size, soloNoLeidas),
    queryFn: () => getNotificaciones({ page, size, soloNoLeidas }),
    placeholderData: keepPreviousData,
    enabled,
  });
}

function useInvalidarBandeja() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.listas() }),
      queryClient.invalidateQueries({
        queryKey: notificacionesKeys.cantidadNoLeidas(),
      }),
    ]);
}

export function useMarcarNotificacionLeida() {
  const invalidar = useInvalidarBandeja();
  return useMutation({
    mutationFn: marcarNotificacionLeida,
    onSuccess: invalidar,
  });
}

export function useMarcarTodasLeidas() {
  const invalidar = useInvalidarBandeja();
  return useMutation({
    mutationFn: marcarTodasLeidas,
    onSuccess: invalidar,
  });
}

export function useConfiguracionNotificaciones() {
  return useQuery({
    queryKey: notificacionesKeys.configuracion(),
    queryFn: getConfiguracionNotificaciones,
  });
}

export function useModificarConfiguracionNotificacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tipo,
      habilitada,
    }: {
      tipo: TipoNotificacion;
      habilitada: boolean;
    }) => modificarConfiguracionNotificacion(tipo, habilitada),
    onSuccess: (actualizada) => {
      queryClient.setQueryData<ConfiguracionNotificacionDto[]>(
        notificacionesKeys.configuracion(),
        (actual) =>
          actual?.map((item) =>
            item.tipo === actualizada.tipo ? actualizada : item,
          ),
      );
    },
  });
}

export function useEnviarAvisoGlobal() {
  const invalidar = useInvalidarBandeja();
  return useMutation({
    mutationFn: enviarAvisoGlobal,
    // El administrador puede ser destinatario de su propio aviso.
    onSuccess: invalidar,
  });
}
