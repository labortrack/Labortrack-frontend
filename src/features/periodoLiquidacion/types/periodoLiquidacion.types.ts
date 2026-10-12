export type TipoPeriodo = "QUINCENAL" | "MENSUAL";

export type EstadoPeriodoLiquidacion = "PENDIENTE" | "PRE_LIQUIDADO" | "CERRADO";

export interface PeriodoLiquidacionResponseDto {
  id: number;
  descripcionPeriodoLiquidacion: string;
  /** yyyy-MM-dd */
  fechaDesde: string;
  /** yyyy-MM-dd */
  fechaHasta: string;
  /** yyyy-MM-ddTHH:mm:ss */
  fechaEjecucionPreLiquidacion: string;
  tipoPeriodo: TipoPeriodo;
  estadoPeriodoLiquidacion: EstadoPeriodoLiquidacion;
  vigente: boolean;
}

/** La fecha de fin no se envía: el backend la deriva de fechaDesde y tipoPeriodo. */
export interface PeriodoLiquidacionRequestDto {
  descripcionPeriodoLiquidacion: string;
  fechaDesde: string;
  /** Opcional: si es null, el backend la programa para el día siguiente al cierre. */
  fechaEjecucionPreLiquidacion: string | null;
  tipoPeriodo: TipoPeriodo;
}

/** El rango de fechas queda fijado en el alta: solo se editan estos campos. */
export interface PeriodoLiquidacionModificacionRequestDto {
  descripcionPeriodoLiquidacion: string;
  fechaEjecucionPreLiquidacion: string | null;
}

export type TabFiltroPeriodo = "Todos" | "Activos" | "Inactivos";
