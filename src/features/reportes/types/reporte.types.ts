export type TipoReporte =
  | "PRESENTISMO"
  | "HORAS_TRABAJADAS"
  | "TIEMPO_MUERTO_CUADRILLAS"
  | "DOTACION_OBRAS"
  | "SOLICITUDES_AUSENCIA"
  | "PADRON_PERSONAL"
  | "STOCK_EPP"
  | "ENTREGAS_EPP"
  | "PERIODOS_LIQUIDACION";

export type FormatoExportacion = "PDF" | "EXCEL";

export type FiltroReporte =
  | "RANGO_FECHAS"
  | "FECHA_CORTE"
  | "OBRA"
  | "CUADRILLA"
  | "ESTADO";

/** PORCENTAJE viene en escala 0-100. */
export type TipoDato =
  | "TEXTO"
  | "ENTERO"
  | "DECIMAL"
  | "PORCENTAJE"
  | "FECHA"
  | "FECHA_HORA";

export interface TipoReporteResponseDto {
  codigo: TipoReporte;
  titulo: string;
  descripcion: string;
  categoria: string;
  formatos: FormatoExportacion[];
  filtros: FiltroReporte[];
  opcionesEstado: string[];
}

export interface ColumnaReporteDto {
  clave: string;
  titulo: string;
  tipoDato: TipoDato;
}

export interface IndicadorReporteDto {
  etiqueta: string;
  valor: string | number | null;
  tipoDato: TipoDato;
}

export type ValorReporte = string | number | null;

export interface ReporteResponseDto {
  tipo: TipoReporte;
  titulo: string;
  fechaGeneracion: string;
  filtrosAplicados: string[];
  resumen: IndicadorReporteDto[];
  columnas: ColumnaReporteDto[];
  filas: Record<string, ValorReporte>[];
}

/** Fechas en formato ISO (yyyy-MM-dd). */
export interface ReporteFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  fechaCorte?: string;
  obraId?: number;
  cuadrillaId?: number;
  estado?: string;
}
