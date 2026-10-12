import { cn } from "@/shared/utils/cn";
import type { NotificacionDto } from "../types/notificaciones.types";
import {
  formatFechaNotificacion,
  iconoPorTipo,
} from "../utils/notificacionPresentacion";

interface NotificacionItemProps {
  notificacion: NotificacionDto;
  onSelect: (notificacion: NotificacionDto) => void;
  compact?: boolean;
}

export function NotificacionItem({
  notificacion,
  onSelect,
  compact,
}: NotificacionItemProps) {
  const Icon = iconoPorTipo[notificacion.tipo];
  const esAviso = notificacion.tipo === "AVISO_GLOBAL";

  return (
    <button
      type="button"
      onClick={() => onSelect(notificacion)}
      className={cn(
        "flex w-full items-start gap-3 rounded-control px-3 py-3 text-left transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        !notificacion.leida && "bg-primary-soft/40",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          esAviso ? "bg-warning-soft text-warning" : "bg-muted text-primary",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span
            className={cn(
              "text-sm text-foreground",
              notificacion.leida ? "font-medium" : "font-bold",
            )}
          >
            {notificacion.titulo}
          </span>
          {!notificacion.leida ? (
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              aria-label="No leída"
            />
          ) : null}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-sm text-foreground-muted",
            compact && "line-clamp-2",
          )}
        >
          {notificacion.mensaje}
        </span>
        <span className="mt-1 block text-xs text-foreground-muted">
          {formatFechaNotificacion(notificacion.fechaAlta)}
        </span>
      </span>
    </button>
  );
}
