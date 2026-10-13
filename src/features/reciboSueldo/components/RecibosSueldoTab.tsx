import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { EmitirLote, ImprimirLote } from "./AccionesLote";
import { CompletarPreLiquidacion } from "./CompletarPreLiquidacion";
import { PreLiquidacionPendiente } from "./PreLiquidacionPendiente";
import { RecibosGrilla } from "./RecibosGrilla";
import { useRecibosDelPeriodo } from "../hooks/useRecibosSueldo";
import { usePeriodosLiquidacion } from "@/features/periodoLiquidacion/hooks/usePeriodosLiquidacion";
import type { PeriodoLiquidacionResponseDto } from "@/features/periodoLiquidacion/types/periodoLiquidacion.types";
import {
  ESTADO_PERIODO_BADGE_VARIANT,
  ESTADO_PERIODO_LABELS,
  elegirPeriodoPorDefecto,
  formatFecha,
} from "@/features/periodoLiquidacion/utils/periodoLiquidacion";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components";
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export function RecibosSueldoTab() {
  const periodosQuery = usePeriodosLiquidacion("Activos");
  const periodos = periodosQuery.data ?? [];
  const [periodoElegidoId, setPeriodoElegidoId] = useState<number | null>(
    null,
  );

  const periodo =
    periodos.find((p) => p.id === periodoElegidoId) ??
    elegirPeriodoPorDefecto(periodos);

  if (periodosQuery.isPending) {
    return <LoadingState label="Cargando períodos de liquidación..." />;
  }
  if (periodosQuery.isError) {
    return (
      <ErrorState
        message={
          normalizeApiError(
            periodosQuery.error,
            "No se pudieron obtener los períodos de liquidación.",
          ).message
        }
        onRetry={() => void periodosQuery.refetch()}
      />
    );
  }
  if (!periodo) {
    return (
      <EmptyState
        title="No hay períodos de liquidación"
        description="Creá un período en la pestaña Configuración Períodos para empezar a liquidar recibos."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={String(periodo.id)}
            onValueChange={(value) => setPeriodoElegidoId(Number(value))}
          >
            <SelectTrigger
              className="w-full sm:w-80"
              aria-label="Período de liquidación"
            >
              <span className="flex min-w-0 items-center gap-2">
                <CalendarRange className="size-4 shrink-0 text-primary" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              {periodos.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.descripcionPeriodoLiquidacion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
  
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <span className="tabular-nums">
              {formatFecha(periodo.fechaDesde)} al{" "}
              {formatFecha(periodo.fechaHasta)}
            </span>
            <Badge
              variant={ESTADO_PERIODO_BADGE_VARIANT[periodo.estadoPeriodoLiquidacion]}
            >
              {ESTADO_PERIODO_LABELS[periodo.estadoPeriodoLiquidacion]}
            </Badge>
          </div>
        </div>

        {periodo.estadoPeriodoLiquidacion === "PRE_LIQUIDADO" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <CompletarPreLiquidacion periodo={periodo} />
            <EmitirLote periodo={periodo} />
          </div>
        ) : periodo.estadoPeriodoLiquidacion === "CERRADO" ? (
          <ImprimirLote periodo={periodo} />
        ) : null}
      </div>

      {periodo.estadoPeriodoLiquidacion === "PENDIENTE" ? (
        <PreLiquidacionPendiente periodo={periodo} />
      ) : (
        <RecibosDelPeriodo key={periodo.id} periodo={periodo} />
      )}
    </div>
  );
}

function RecibosDelPeriodo({
  periodo,
}: {
  periodo: PeriodoLiquidacionResponseDto;
}) {
  const query = useRecibosDelPeriodo(periodo.id);

  if (query.isPending) {
    return <LoadingState label="Cargando recibos..." />;
  }
  if (query.isError) {
    return (
      <ErrorState
        message={
          normalizeApiError(query.error, "No se pudieron obtener los recibos.")
            .message
        }
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (query.data.length === 0) {
    return (
      <EmptyState
        title="El período no tiene recibos"
        description={
          periodo.estadoPeriodoLiquidacion === "PRE_LIQUIDADO"
            ? "La pre-liquidación no generó recibos. Si hubo empleados omitidos, corregí el motivo y usá «Completar pre-liquidación»."
            : "El período se cerró sin recibos."
        }
      />
    );
  }

  return <RecibosGrilla recibos={query.data} />;
}
