/**
 * Diccionario opcional de etiquetas para sobreescribir nombres puntuales de entidades (siglas o nombres especiales).
 * NO define qué entidades existen en el sistema ni se usa como fuente de datos;
 * solo sobreescribe el formato visual de claves puntuales que vienen del backend.
 */
export const DICCIONARIO_ENTIDADES_OVERRIDE: Record<string, string> = {
  epp: "EPP",
  empleado_epp: "Entrega de EPP",
  categoria_uocra: "Categoría UOCRA",
  categoria_zona: "Categoría por Zona",
  cuadro_tarifario: "Cuadro Tarifario",
  plan_trabajo_cuadrilla: "Plan de Trabajo de Cuadrilla",
  empleado_grupo_cuadrilla: "Empleado Grupo Cuadrilla",
};

/**
 * Deriva una etiqueta amigable y legible para el usuario a partir de una clave técnica de entidad.
 * Si la clave figura en DICCIONARIO_ENTIDADES_OVERRIDE, retorna ese valor.
 * De lo contrario, formatea la clave separando guiones bajos y capitalizando la primera letra
 * (ej: "empleado_grupo_cuadrilla" -> "Empleado grupo cuadrilla").
 */
export function formatNombreEntidad(clave: string): string {
  if (!clave) return "";

  const claveLower = clave.toLowerCase();
  if (DICCIONARIO_ENTIDADES_OVERRIDE[claveLower]) {
    return DICCIONARIO_ENTIDADES_OVERRIDE[claveLower];
  }

  // Separar guiones bajos, guiones y camelCase
  const separada = clave
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  if (!separada) return clave;

  // Capitalizar la primera letra y mantener el resto en minúsculas
  return separada.charAt(0).toUpperCase() + separada.slice(1).toLowerCase();
}

/**
 * Campos técnicos que deben omitirse del detalle de modificaciones de auditoría.
 */
export const CAMPOS_OCULTOS: readonly string[] = [
  "id",
  "fechaAlta",
  "fecha_alta",
  "idUsuario",
  "id_usuario",
] as const;

// Tipos de compatibilidad
export type EntidadAuditable = string;
