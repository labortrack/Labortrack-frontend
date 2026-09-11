interface EntradaHistorial {
  fechaDesde: string;
  fechaHasta: string | null;
}

/**
 * El vigente (fechaHasta null) siempre va primero, sin importar su fechaDesde.
 * Evita que una fila cerrada con fecha futura (ej: una baja cargada a futuro)
 * quede por encima del estado/categoría realmente actual.
 */
export function ordenarHistorialPorVigencia<T extends EntradaHistorial>(
  historial: T[],
): T[] {
  return [...historial].sort((a, b) => {
    if (!a.fechaHasta && b.fechaHasta) return -1;
    if (a.fechaHasta && !b.fechaHasta) return 1;
    return b.fechaDesde.localeCompare(a.fechaDesde);
  });
}
