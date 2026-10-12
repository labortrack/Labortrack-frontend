import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@/shared/ui";
import { useAbrirNotificacion } from "../hooks/useAbrirNotificacion";
import {
  useCantidadNoLeidas,
  useMarcarTodasLeidas,
  useNotificaciones,
} from "../hooks/useNotificaciones";
import { NotificacionItem } from "./NotificacionItem";

const CANTIDAD_RECIENTES = 6;

export function NotificacionesBell() {
  const [open, setOpen] = useState(false);
  const cantidadQuery = useCantidadNoLeidas();
  const noLeidas = cantidadQuery.data ?? 0;
  const recientesQuery = useNotificaciones(0, CANTIDAD_RECIENTES, false, open);
  const marcarTodas = useMarcarTodasLeidas();
  const abrir = useAbrirNotificacion(() => setOpen(false));
  const recientes = recientesQuery.data?.content ?? [];
  const etiquetaBadge = noLeidas > 99 ? "99+" : String(noLeidas);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative rounded-control p-2 text-foreground-muted transition-colors hover:bg-subtle hover:text-foreground data-[state=open]:bg-subtle"
          aria-label={
            noLeidas > 0
              ? `Notificaciones, ${noLeidas} sin leer`
              : "Notificaciones"
          }
        >
          <Bell className="size-5" />
          {noLeidas > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-white">
              {etiquetaBadge}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(380px,calc(100vw-2rem))] p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-bold text-foreground">Notificaciones</p>
          <Button
            variant="link"
            size="sm"
            className="text-xs"
            disabled={noLeidas === 0 || marcarTodas.isPending}
            onClick={() => marcarTodas.mutate()}
          >
            <CheckCheck />
            Marcar todas como leídas
          </Button>
        </div>
        <div className="max-h-[420px] overflow-y-auto p-1">
          {recientesQuery.isLoading ? (
            <div className="flex justify-center p-6">
              <Spinner className="size-6" />
            </div>
          ) : recientesQuery.isError ? (
            <p className="p-6 text-center text-sm text-foreground-muted">
              No pudimos cargar las notificaciones.
            </p>
          ) : recientes.length === 0 ? (
            <p className="p-6 text-center text-sm text-foreground-muted">
              No tenés notificaciones.
            </p>
          ) : (
            recientes.map((notificacion) => (
              <NotificacionItem
                key={notificacion.id}
                notificacion={notificacion}
                onSelect={abrir}
                compact
              />
            ))
          )}
        </div>
        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to="/notificaciones" onClick={() => setOpen(false)}>
              Ver todas
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
