import { HardHat, Users } from "lucide-react";
import { CuadrillaStatusBadge } from "@/features/cuadrilla/components/CuadrillaStatusBadge";
import type { CuadrillaLideradaDto } from "../types/dashboard.types";

interface MisCuadrillasListProps {
  data: CuadrillaLideradaDto[];
}

export function MisCuadrillasList({ data }: MisCuadrillasListProps) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-sm text-foreground-muted">
        No tenés cuadrillas a cargo en este momento.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {data.map((cuadrilla) => (
        <li
          key={cuadrilla.cuadrillaId}
          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
              <HardHat className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {cuadrilla.nombreCuadrilla}
              </p>
              <p className="truncate text-xs text-foreground-muted">{cuadrilla.nombreObra}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-foreground-muted">
              <Users className="size-3.5" />
              {cuadrilla.personalVigente}
            </span>
            {cuadrilla.estadoActual ? (
              <CuadrillaStatusBadge estado={cuadrilla.estadoActual} />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
