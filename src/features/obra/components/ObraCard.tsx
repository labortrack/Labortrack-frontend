import { ArrowRightLeft, MapPin, Pencil, Trash2 } from "lucide-react";
import { EstadoBadge } from "../estado/components/EstadoBadge";
import { getEstadoStyle } from "../estado/utils/estadoStyles";
import type { ObraResponseDto } from "../types/obra.types";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

interface ObraCardProps {
  obra: ObraResponseDto;
  onEdit: (o: ObraResponseDto) => void;
  onClose: (o: ObraResponseDto) => void;
  onChangeEstado?: (o: ObraResponseDto) => void;
  onDetalle?: (o: ObraResponseDto) => void;
}

export function ObraCard({
  obra,
  onEdit,
  onClose,
  onChangeEstado,
  onDetalle,
}: ObraCardProps) {
  const isFinalizada =
    obra.estadoActual.toUpperCase() === "SUSPENDIDA" ||
    obra.estadoActual.toUpperCase() === "FINALIZADA" ||
    obra.estadoActual.toUpperCase() === "ARCHIVADA";

  const estadoStyle = getEstadoStyle(obra.estadoActual);

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-lg border border-border bg-card shadow-soft transition-all hover:shadow-floating",
        isFinalizada && "opacity-80",
      )}
    >
      <div>
        {/* Top color stripe per estado */}
        <div
          className="h-1.5 w-full rounded-t-lg"
          style={{ backgroundColor: estadoStyle.hex }}
        />

        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Título + nomenclatura */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                className="text-left line-clamp-2 text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => onDetalle?.(obra)}
              >
                {obra.nombreObra}
              </button>
            </div>
            <p className="mt-1 text-xs font-mono text-foreground-muted">
              {obra.nomenclatura}
            </p>
          </div>

          {/* Localización */}
          <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
            <MapPin className="size-3.5 shrink-0 text-primary/70" />
            <span className="truncate">
              {obra.localidad}, {obra.provincia}{obra.pais ? ` (${obra.pais})` : ""}
            </span>
          </div>

          {/* Estado badge */}
          <div className="flex items-center justify-between pt-1">
            <EstadoBadge estado={obra.estadoActual} />
            {obra.fechaInicioEstadoActual ? (
              <span className="text-[11px] text-foreground-muted">
                Desde {obra.fechaInicioEstadoActual}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Card footer: actions */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-subtle/30">
        <span className="text-[11px] font-mono text-foreground-muted">
          ID #{obra.id}
        </span>
        <div className="flex items-center gap-1">
          {onChangeEstado ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChangeEstado(obra)}
                  className="size-8 text-foreground-muted hover:bg-accent-soft hover:text-accent"
                  aria-label="Cambiar estado"
                >
                  <ArrowRightLeft className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Transicionar estado</TooltipContent>
            </Tooltip>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEdit(obra)}
                className="size-8 text-foreground-muted hover:bg-primary-soft hover:text-primary"
                aria-label="Editar"
              >
                <Pencil className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar datos de obra</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onClose(obra)}
                disabled={isFinalizada}
                className="size-8 text-foreground-muted hover:bg-error-soft hover:text-error disabled:opacity-30"
                aria-label="Dar de baja / suspender"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFinalizada ? "Obra ya suspendida/finalizada" : "Dar de baja obra"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
