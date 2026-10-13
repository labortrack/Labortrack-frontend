import type { EmpleadoResumenDto } from "../api/documentacionApi";

// ─── Valores de la barra de filtros de documentos ─────────────────────────────

export interface DocumentosFiltrosValores {
  nombre: string;
  tipoDocumentoId?: number;
  /** Formato ISO `yyyy-MM-dd`, o vacío. */
  fechaDesde: string;
  /** Formato ISO `yyyy-MM-dd`, o vacío. */
  fechaHasta: string;
  /** Solo lo usan ADMIN y RRHH; se guarda el objeto para mostrar su nombre. */
  empleado: EmpleadoResumenDto | null;
}

export const FILTROS_VACIOS: DocumentosFiltrosValores = {
  nombre: "",
  tipoDocumentoId: undefined,
  fechaDesde: "",
  fechaHasta: "",
  empleado: null,
};

/** Devuelve el mensaje de error del rango, o cadena vacía si es válido. */
export function validarRangoFechas(fechaDesde: string, fechaHasta: string): string {
  if (fechaDesde && fechaHasta && fechaHasta < fechaDesde) {
    return "La fecha hasta no puede ser anterior a la fecha desde.";
  }
  return "";
}

export function hayFiltrosActivos(valores: DocumentosFiltrosValores): boolean {
  return Boolean(
    valores.nombre.trim() ||
      valores.tipoDocumentoId ||
      valores.fechaDesde ||
      valores.fechaHasta ||
      valores.empleado,
  );
}
