import type {
  EstadoReciboSueldo,
  LineaRecibo,
  ReciboSueldoDetalleDto,
} from "../types/reciboSueldo.types";

export const ESTADO_RECIBO_LABELS: Record<EstadoReciboSueldo, string> = {
  BORRADOR: "Borrador",
  GENERADO: "Generado",
  PENDIENTE_LECTURA: "Pendiente de lectura",
  LEIDO: "Leído",
  CANCELADO: "Cancelado",
};

/** Orden del ciclo de vida según el DTE de ReciboSueldo. */
export const ESTADOS_RECIBO: EstadoReciboSueldo[] = [
  "BORRADOR",
  "GENERADO",
  "PENDIENTE_LECTURA",
  "LEIDO",
  "CANCELADO",
];

export const ESTADO_RECIBO_BADGE_VARIANT = {
  BORRADOR: "warning",
  GENERADO: "primary",
  PENDIENTE_LECTURA: "neutral",
  LEIDO: "success",
  CANCELADO: "error",
} as const satisfies Record<EstadoReciboSueldo, string>;

const horasFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 2,
});

export function formatHoras(horas: number) {
  return `${horasFormatter.format(horas)} h`;
}

const cantidadFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCantidad(cantidad: number | null) {
  return cantidad == null ? "" : cantidadFormatter.format(cantidad);
}

/**
 * Filas del recibo tal como se imprimen. Espejo de ReciboPdfServiceImpl.armarFilas: el
 * sueldo básico y la suma no remunerativa no son líneas del detalle, así que se arman desde
 * el encabezado y se anteponen. El básico es horas × valor hora total, redondeado a 2
 * decimales, igual que en la liquidación.
 */
export function armarFilasRecibo(recibo: ReciboSueldoDetalleDto): LineaRecibo[] {
  const basico =
    Math.round(recibo.cantidadDeHoras * recibo.valorHoraTotal * 100) / 100;

  const filas: LineaRecibo[] = [
    {
      id: null,
      descripcion: "Sueldo básico",
      columna: "REMUNERATIVO",
      cantidad: recibo.cantidadDeHoras,
      valor: basico,
      quitable: false,
    },
  ];
  if (recibo.sumaNoRemunerativa > 0) {
    filas.push({
      id: null,
      descripcion: "Suma no remunerativa",
      columna: "NO_REMUNERATIVO",
      cantidad: null,
      valor: recibo.sumaNoRemunerativa,
      quitable: false,
    });
  }
  return [...filas, ...recibo.lineas];
}

/** Exacto por construcción: el neto es el bruto menos la suma de las deducciones. */
export function totalDeducciones(recibo: ReciboSueldoDetalleDto) {
  return recibo.totalBruto - recibo.totalNeto;
}
