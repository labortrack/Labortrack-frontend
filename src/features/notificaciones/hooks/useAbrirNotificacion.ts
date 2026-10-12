import { useNavigate } from "react-router-dom";
import type { NotificacionDto } from "../types/notificaciones.types";
import { useMarcarNotificacionLeida } from "./useNotificaciones";

/**
 * Marca la notificación como leída y navega a su link, si tiene.
 */
export function useAbrirNotificacion(onAbrir?: () => void) {
  const navigate = useNavigate();
  const marcarLeida = useMarcarNotificacionLeida();

  return (notificacion: NotificacionDto) => {
    if (!notificacion.leida) {
      marcarLeida.mutate(notificacion.id);
    }
    onAbrir?.();
    if (notificacion.link) {
      navigate(notificacion.link);
    }
  };
}
