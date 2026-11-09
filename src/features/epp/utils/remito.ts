import type { ItemRemito } from "../types/epp.types";

/** Máximo de EPP distintos por remito; el backend rechaza más. */
export const MAX_ITEMS_REMITO = 50;

/** Número impreso del remito: el id con ceros a la izquierda (000123), igual que el PDF. */
export function formatNumeroRemito(id: number): string {
  return String(id).padStart(6, "0");
}

/** Resumen de una línea de los ítems de un remito (ej: "Guantes x2, Casco x1"). */
export function resumenItems(
  items: readonly Pick<ItemRemito, "nombreEpp" | "cantidad">[],
): string {
  return items.map((item) => `${item.nombreEpp} x${item.cantidad}`).join(", ");
}

/**
 * EPP ya elegidos en las demás filas del formulario, para deshabilitarlos en la fila `index`.
 * Ignora las filas sin EPP seleccionado (eppId 0).
 */
export function eppIdsElegidosEnOtrasFilas(
  items: readonly { eppId: number }[],
  index: number,
): Set<number> {
  const elegidos = new Set<number>();
  items.forEach((item, i) => {
    if (i !== index && item.eppId > 0) elegidos.add(item.eppId);
  });
  return elegidos;
}
