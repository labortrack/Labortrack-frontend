import { Building2, HardHat, Wrench } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import type { MiAsignacionActualDto } from "../types/dashboard.types";

interface MiAsignacionCardProps {
  data: MiAsignacionActualDto | null;
}

export function MiAsignacionCard({ data }: MiAsignacionCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <HardHat className="size-4 text-primary" />
          Mi asignación actual
        </h3>

        {data ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-4 shrink-0 text-foreground-muted" />
              <div>
                <p className="font-semibold text-foreground">{data.nombreObra}</p>
                <p className="text-xs text-foreground-muted">Obra</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <HardHat className="size-4 shrink-0 text-foreground-muted" />
              <div>
                <p className="font-semibold text-foreground">{data.nombreCuadrilla}</p>
                <p className="text-xs text-foreground-muted">Cuadrilla</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Wrench className="size-4 shrink-0 text-foreground-muted" />
              <div>
                <p className="font-semibold text-foreground">{data.tipoActividad}</p>
                <p className="text-xs text-foreground-muted">
                  Desde {new Date(data.desde).toLocaleDateString("es-AR")}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-foreground-muted">
            No tenés una asignación vigente a una cuadrilla en este momento.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
