import { VISIBILIDAD_LABELS, type Visibilidad } from "../types/documentacion.types";

/** Etiqueta legible de la visibilidad de un documento; "Sin visibilidad" si no tiene. */
export function etiquetaVisibilidad(visibilidad: string | null | undefined): string {
  if (!visibilidad) return "Sin visibilidad";
  return VISIBILIDAD_LABELS[visibilidad as Visibilidad]?.label ?? visibilidad;
}
