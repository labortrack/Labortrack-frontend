import { MapPin, Pencil, Trash2 } from "lucide-react";
import { EstadoBadge } from "../estado/components/EstadoBadge";
import { getEstadoStyle } from "../estado/utils/estadoStyles";
import { CapatazAvatar } from "./CapatazAvatar";
import type { Obra } from "../types/obra.types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

interface ObraCardProps {
  obra: Obra;
  onEdit: (o: Obra) => void;
  onClose: (o: Obra) => void;
  onDetalle: (o: Obra) => void;
}

export function ObraCard({
  obra,
  onEdit,
  onClose,
  onDetalle,
}: ObraCardProps) {
  const isArchivada =
    obra.estado === "ARCHIVADA" || obra.estado === "FINALIZADA";
  const estadoStyle = getEstadoStyle(obra.estado);

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card shadow-soft transition-all hover:shadow-floating",
        isArchivada && "opacity-75",
      )}
    >
      {/* Top color stripe per estado */}
      <div
        className="h-1.5 w-full rounded-t-lg"
        style={{ backgroundColor: estadoStyle.hex }}
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Título + nomenclatura */}
        <div>
          <button
            type="button"
            className="mb-1 text-left line-clamp-2 text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
            onClick={() => onDetalle(obra)}
          >
            {obra.nombre}
          </button>
          <p className="text-xs font-mono text-foreground-muted">{obra.nomenclatura}</p>
        </div>

        {/* Localización */}
        <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">
            {obra.localidad}, {obra.provincia}
          </span>
        </div>

        {/* Capataz */}
        <div className="flex items-center gap-2">
          <CapatazAvatar nombre={obra.capatazNombre} size="sm" />
          <div className="min-w-0">
            <span className="block text-[11px] text-foreground-muted">
              Capataz
            </span>
            <p className="truncate text-xs font-medium text-foreground">
              {obra.capatazNombre}
            </p>
          </div>
        </div>

        {/* Estado badge */}
        <div>
          <EstadoBadge estado={obra.estado} />
        </div>
      </div>

      {/* Card footer: actions */}
      <div className="flex items-center justify-end gap-1 border-t border-border px-4 py-2.5 bg-subtle/30">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onEdit(obra)}
              className="flex size-8 items-center justify-center rounded-control text-foreground-muted transition-colors hover:bg-primary-soft hover:text-primary"
              aria-label="Editar"
            >
              <Pencil className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Editar frente de trabajo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onClose(obra)}
              disabled={isArchivada}
              className="flex size-8 items-center justify-center rounded-control text-foreground-muted transition-colors hover:bg-error-soft hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Dar de baja"
            >
              <Trash2 className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {isArchivada ? "Obra archivada" : "Cierre administrativo"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
