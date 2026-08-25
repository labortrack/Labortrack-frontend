import { Calendar, CheckCircle2, History, MessageSquareQuote } from "lucide-react";
import { EstadoBadge } from "../estado/components/EstadoBadge";
import type { HistorialEstadoObraDto } from "../types/obra.types";
import { Card, CardContent } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";

interface HistorialEstadosTimelineProps {
  historial: HistorialEstadoObraDto[];
  className?: string;
}

export function HistorialEstadosTimeline({
  historial,
  className,
}: HistorialEstadosTimelineProps) {
  if (!historial || historial.length === 0) {
    return (
      <Card className="py-8 text-center text-foreground-muted">
        <History className="mx-auto size-8 mb-2 opacity-50" />
        <p className="text-sm font-medium">
          No hay registros de historial disponibles para esta obra.
        </p>
      </Card>
    );
  }

  // Most recent first for timeline audit readability
  const sorted = [...historial].reverse();

  return (
    <div className={cn("relative space-y-6 pl-6 sm:pl-8", className)}>
      {/* Vertical line running through all items */}
      <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-border" />

      {sorted.map((item) => {
        const isCurrent = !item.fechaHasta;

        return (
          <div key={item.id} className="relative group">
            {/* Timeline node icon / indicator */}
            <span
              className={cn(
                "absolute -left-6 sm:-left-8 top-1 flex size-5 sm:size-7 items-center justify-center rounded-full ring-4 ring-page transition-all",
                isCurrent
                  ? "bg-primary text-white shadow-soft ring-primary-soft"
                  : "bg-muted text-foreground-muted border border-border group-hover:border-primary/50",
              )}
            >
              {isCurrent ? (
                <CheckCircle2 className="size-3 sm:size-4" />
              ) : (
                <span className="size-1.5 rounded-full bg-foreground-muted" />
              )}
            </span>

            {/* Content card */}
            <Card
              className={cn(
                "transition-all",
                isCurrent
                  ? "border-primary/30 shadow-soft bg-card"
                  : "bg-card/70 hover:bg-card hover:border-border-strong",
              )}
            >
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <EstadoBadge estado={item.nombreEstadoObra} />
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success">
                        <span className="size-1.5 rounded-full bg-success animate-pulse" />
                        Estado Vigente
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                    <Calendar className="size-3.5" />
                    <span>
                      {item.fechaDesde}
                      {item.fechaHasta ? ` — ${item.fechaHasta}` : " — Actualidad"}
                    </span>
                  </div>
                </div>

                {item.motivoCambio ? (
                  <div className="rounded-md border border-border/70 bg-subtle/50 p-3 text-xs leading-relaxed text-foreground">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground-muted mb-1">
                      <MessageSquareQuote className="size-3 text-primary" />
                      <span>Motivo / Justificación:</span>
                    </div>
                    <p className="italic text-foreground/90">
                      "{item.motivoCambio}"
                    </p>
                  </div>
                ) : null}

                <div className="text-right">
                  <span className="font-mono text-[10px] text-foreground-muted">
                    Registro de Auditoría #{item.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
