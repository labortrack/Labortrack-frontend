import { Calendar, CheckCircle2, History, MapPin, Tag } from "lucide-react";
import type { EmpleadoCategoriaResponseDto } from "../types/empleadoCategoria.types";
import { formatDate } from "./EmpleadoTable";
import { Badge } from "@/shared/ui";

interface EmpleadoCategoriaTimelineProps {
  historialCategoria: EmpleadoCategoriaResponseDto[];
}

export function EmpleadoCategoriaTimeline({
  historialCategoria,
}: EmpleadoCategoriaTimelineProps) {
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <History className="size-5 text-primary" />
        <h3 className="text-base font-semibold text-foreground">
          Historial de Categoría UOCRA
        </h3>
      </div>

      {historialCategoria.length === 0 ? (
        <p className="py-6 text-center text-sm text-foreground-muted">
          Sin historial de categoría registrado para este legajo.
        </p>
      ) : (
        <div className="relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {historialCategoria.map((item, index) => {
            const isCurrent = !item.fechaHasta;

            return (
              <div key={item.id || index} className="relative pb-6 last:pb-0">
                <span
                  className={`absolute -left-6 top-1.5 flex size-5 items-center justify-center rounded-full text-white ${
                    isCurrent
                      ? "bg-primary ring-4 ring-primary/20"
                      : "bg-border-strong"
                  }`}
                >
                  <CheckCircle2 className="size-3.5" />
                </span>

                <div className="rounded-lg border border-border bg-subtle/50 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Tag className="size-3.5 text-foreground-muted" />
                      {item.nombreCategoria}
                    </span>
                    {isCurrent ? (
                      <Badge variant="success">Categoría Actual</Badge>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-foreground-muted">
                    <MapPin className="size-3.5" />
                    <span>{item.nombreZona}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-foreground-muted">
                    <Calendar className="size-3.5" />
                    <span>
                      Desde: <strong>{formatDate(item.fechaDesde)}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Hasta:{" "}
                      <strong>
                        {item.fechaHasta ? formatDate(item.fechaHasta) : "Vigente"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
