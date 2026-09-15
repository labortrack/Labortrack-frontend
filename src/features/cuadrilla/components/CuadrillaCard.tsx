import { Card, CardContent, Button } from "@/shared/ui";
import { InitialsAvatar } from "@/shared/components";
import {
  Users,
  HardHat,
  Pencil,
  Trash2,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { CuadrillaStatusBadge } from "./CuadrillaStatusBadge";
import type { CuadrillaResponseDto } from "../types/cuadrilla.types";
import { cn } from "@/shared/utils/cn";

interface CuadrillaCardProps {
  cuadrilla: CuadrillaResponseDto;
  isSelected?: boolean;
  onSelect: (cuadrilla: CuadrillaResponseDto) => void;
  onEdit: (cuadrilla: CuadrillaResponseDto) => void;
  onAsignarLider: (cuadrilla: CuadrillaResponseDto) => void;
  onBaja: (cuadrilla: CuadrillaResponseDto) => void;
  onReactivar: (cuadrilla: CuadrillaResponseDto) => void;
}

export function CuadrillaCard({
  cuadrilla,
  isSelected,
  onSelect,
  onEdit,
  onAsignarLider,
  onBaja,
  onReactivar,
}: CuadrillaCardProps) {
  const isSuspended = cuadrilla.estadoActual === "SUSPENDIDA";
  const isFinalizada = cuadrilla.estadoActual === "FINALIZADA";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer border",
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md bg-card"
          : "border-border hover:border-primary/40 bg-card/80",
        isSuspended && "opacity-80 bg-muted/30"
      )}
      onClick={() => onSelect(cuadrilla)}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        {/* Top bar: Title + Badge */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              {cuadrilla.grupo?.tipoActividad || "General"}
            </span>
            <h3 className="text-base font-bold text-foreground mt-0.5 group-hover:text-primary transition-colors line-clamp-1">
              {cuadrilla.nombre}
            </h3>
          </div>
          <CuadrillaStatusBadge estado={cuadrilla.estadoActual} />
        </div>

        {/* Info row: Líder y Operarios */}
        <div className="space-y-2.5 rounded-lg bg-subtle/60 p-3 border border-border/40 text-xs">
          {/* Líder */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {cuadrilla.lider ? (
                <>
                  <InitialsAvatar
                    name={`${cuadrilla.lider.nombre} ${cuadrilla.lider.apellido}`}
                    size="sm"
                    className="size-6 text-[10px]"
                  />
                  <div className="truncate">
                    <span className="font-semibold text-foreground truncate block">
                      {cuadrilla.lider.nombre} {cuadrilla.lider.apellido}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      Líder Designado
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <HardHat className="size-4 text-muted-foreground/60" />
                  <span className="italic">Sin líder asignado</span>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2 text-primary hover:text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onAsignarLider(cuadrilla);
              }}
              disabled={isSuspended || isFinalizada}
            >
              {cuadrilla.lider ? "Cambiar" : "Asignar"}
            </Button>
          </div>

          {/* Contador Operarios */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              <span>Personal activo</span>
            </div>
            <span className="font-bold text-foreground text-xs">
              {cuadrilla.operariosCount ?? 0} operario
              {cuadrilla.operariosCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
              title="Editar nombre"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(cuadrilla);
              }}
              disabled={isSuspended || isFinalizada}
            >
              <Pencil className="size-3.5" />
            </Button>

            {isSuspended ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                title="Reactivar cuadrilla"
                onClick={(e) => {
                  e.stopPropagation();
                  onReactivar(cuadrilla);
                }}
              >
                <RotateCcw className="size-3.5" />
              </Button>
            ) : !isFinalizada ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                title="Dar de baja cuadrilla"
                onClick={(e) => {
                  e.stopPropagation();
                  onBaja(cuadrilla);
                }}
              >
                <Trash2 className="size-3.5" />
              </Button>
            ) : null}
          </div>

          <Button
            type="button"
            variant={isSelected ? "primary" : "outline"}
            size="sm"
            className="h-8 text-xs font-semibold gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(cuadrilla);
            }}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="size-3.5 text-primary-foreground" />
                <span>Nómina Activa</span>
              </>
            ) : (
              <>
                <span>Ver Nómina</span>
                <ChevronRight className="size-3.5" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
