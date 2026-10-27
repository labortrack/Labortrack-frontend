/**
 * Cómo llevar a la vista la card de filtros (o el resultado) al elegir un reporte.
 * "nearest" mueve lo mínimo: si ya está a la vista no se desplaza. Con movimiento
 * reducido el desplazamiento es instantáneo.
 */
export function opcionesScrollFiltros(reducirMovimiento: boolean): ScrollIntoViewOptions {
  return {
    behavior: reducirMovimiento ? "auto" : "smooth",
    block: "nearest",
  };
}
