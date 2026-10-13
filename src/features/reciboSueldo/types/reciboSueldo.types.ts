export type EstadoReciboSueldo =
  | "BORRADOR"
  | "GENERADO"
  | "PENDIENTE_LECTURA"
  | "LEIDO"
  | "CANCELADO";

/** Fila de la grilla de control de un período (RF049). */
export interface ReciboSueldoGrillaDto {
  id: number;
  empleadoId: number;
  apellidoNombre: string;
  /** Clave de la foto en MinIO; la URL firmada se pide aparte (AvatarMinio). */
  fotoPerfilKey: string | null;
  categoria: string;
  zona: string;
  cantidadDeHoras: number;
  totalBruto: number;
  totalNeto: number;
  estado: EstadoReciboSueldo;
}

/** Columna del recibo en la que se imprime una línea. */
export type ColumnaRecibo = "REMUNERATIVO" | "NO_REMUNERATIVO" | "DEDUCCION";

export interface LineaRecibo {
  /** Id del detalle; null en las filas que se arman desde el encabezado (básico, suma NR). */
  id: number | null;
  descripcion: string;
  columna: ColumnaRecibo;
  /** Columna "C/Hs./%": horas, 1 para un monto fijo o el porcentaje aplicado. */
  cantidad: number | null;
  valor: number;
  /** Falso para las líneas de ítems generales: las repone cada recálculo. */
  quitable: boolean;
}

export interface ReciboSueldoDetalleDto {
  id: number;
  empleadoId: number;
  apellidoNombre: string;
  fotoPerfilKey: string | null;
  cuil: string;
  /** yyyy-MM-dd */
  fechaIngreso: string;
  categoria: string;
  zona: string;
  descripcionPeriodo: string;
  fechaDesde: string;
  fechaHasta: string;
  fechaRecibo: string;
  cantidadDeHoras: number;
  valorHoraBasico: number;
  valorHoraAdicional: number;
  valorHoraTotal: number;
  sumaNoRemunerativa: number;
  totalRemunerativo: number;
  totalNoRemunerativo: number;
  totalBruto: number;
  totalNeto: number;
  estado: EstadoReciboSueldo;
  /** yyyy-MM-ddTHH:mm:ss, solo si el empleado confirmó la lectura. */
  fechaHoraLectura: string | null;
  documentoId: number | null;
  /** Conceptos y deducciones. El básico y la suma no remunerativa no vienen como líneas. */
  lineas: LineaRecibo[];
}

export interface EmpleadoOmitido {
  empleadoId: number;
  apellidoNombre: string;
  motivo: string;
}

/** Resumen de una corrida de pre-liquidación. */
export interface ResultadoPreLiquidacion {
  periodoLiquidacionId: number;
  descripcionPeriodo: string;
  fechaEjecucion: string;
  empleadosEvaluados: number;
  recibosGenerados: number;
  omitidos: EmpleadoOmitido[];
}

/** Resumen de la emisión de un lote (RF055): BORRADOR → GENERADO y el período se cierra. */
export interface ResultadoEmisionLote {
  periodoLiquidacionId: number;
  descripcionPeriodo: string;
  fechaEmision: string;
  recibosEmitidos: number;
}

export interface ReciboNoImpreso {
  reciboSueldoId: number;
  apellidoNombre: string;
  motivo: string;
}

/** Resumen de la impresión de un lote (RF056): GENERADO → PENDIENTE_LECTURA con su PDF. */
export interface ResultadoImpresionLote {
  periodoLiquidacionId: number;
  descripcionPeriodo: string;
  fechaImpresion: string;
  recibosImpresos: number;
  noImpresos: ReciboNoImpreso[];
}

export type FiltroEstadoRecibo = "TODOS" | EstadoReciboSueldo;
