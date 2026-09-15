import type { Rubro } from "../types/empresa.types";

// Los value coinciden 1 a 1 con el enum Rubro del backend; los labels son los
// mismos que expone Rubro#getDescripcion() en el backend.
export const RUBRO_LABELS: Record<Rubro, string> = {
  VIALIDAD_Y_PAVIMENTOS: "Vialidad y pavimentos",
  OBRAS_HIDRAULICAS_Y_SANEAMIENTO: "Obras hidráulicas y saneamiento",
  ARQUITECTURA_Y_EDIFICIOS: "Arquitectura y edificios",
  MOVIMIENTO_DE_SUELOS_Y_EXCAVACIONES: "Movimiento de suelos y excavaciones",
  PUENTES_Y_ESTRUCTURAS_DE_HORMIGON: "Puentes y estructuras de hormigón",
  MONTAJE_INDUSTRIAL_Y_ESTRUCTURAS_METALICAS:
    "Montaje industrial y estructuras metálicas",
  INSTALACIONES_ELECTROMECANICAS: "Instalaciones electromecánicas",
  REDES_DE_SERVICIOS: "Redes de servicios",
  OBRAS_DE_URBANIZACION: "Obras de urbanización",
};

export const RUBRO_OPTIONS = Object.entries(RUBRO_LABELS).map(
  ([value, label]) => ({ value: value as Rubro, label }),
);

export function getRubroLabel(rubro: Rubro): string {
  return RUBRO_LABELS[rubro] ?? rubro;
}
