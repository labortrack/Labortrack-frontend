import {
  VISIBILIDAD_LABELS,
  type CategoriaRuteo,
  type Visibilidad,
} from "../types/documentacion.types";

interface ReglaCategoria {
  visibilidades: readonly Visibilidad[];
  admiteRag: boolean;
}

/**
 * Configuración que admite cada categoría de ruteo: las visibilidades por defecto
 * permitidas y si sus documentos pueden procesarse en el RAG.
 *
 * Replica la matriz declarada en CategoriaRuteo.java del backend
 * (com.labortrack.backend.documentacion.model.entity), que es la fuente de verdad.
 * Si cambia allá, se actualiza acá. Es la única copia en el frontend: el formulario,
 * el schema y los helpers de este archivo la leen desde acá.
 */
export const MATRIZ_CATEGORIA_RUTEO: Readonly<Record<CategoriaRuteo, ReglaCategoria>> = {
  LEGAJO_PERSONAL: { visibilidades: ["EMPLEADO"], admiteRag: false },
  RECIBOS_SUELDOS: { visibilidades: ["EMPLEADO"], admiteRag: false },
  HIGIENE_Y_SEGURIDAD: { visibilidades: ["EMPLEADO"], admiteRag: false },
  INSTITUCIONAL: { visibilidades: ["PUBLICO", "RRHH", "CONTADOR"], admiteRag: true },
  AUSENTISMO: { visibilidades: ["EMPLEADO"], admiteRag: false },
};

export interface OpcionesCategoria {
  visibilidades: readonly Visibilidad[];
  admiteRag: boolean;
  /** Única visibilidad permitida, para preseleccionarla; "" si hay varias o ninguna. */
  visibilidadPorDefecto: Visibilidad | "";
}

export interface OpcionVisibilidad {
  valor: string;
  /** True para la visibilidad actual de un tipo existente que la categoría ya no admite. */
  invalida: boolean;
}

function reglaDe(categoria: string): ReglaCategoria | undefined {
  return Object.hasOwn(MATRIZ_CATEGORIA_RUTEO, categoria)
    ? MATRIZ_CATEGORIA_RUTEO[categoria as CategoriaRuteo]
    : undefined;
}

/** Visibilidades y RAG que admite la categoría. Sin categoría (o desconocida) no admite nada. */
export function opcionesPorCategoria(categoria: string): OpcionesCategoria {
  const regla = reglaDe(categoria);
  if (!regla) {
    return { visibilidades: [], admiteRag: false, visibilidadPorDefecto: "" };
  }
  return {
    visibilidades: regla.visibilidades,
    admiteRag: regla.admiteRag,
    visibilidadPorDefecto:
      regla.visibilidades.length === 1 ? regla.visibilidades[0] : "",
  };
}

export function esVisibilidadPermitida(categoria: string, visibilidad: string): boolean {
  return opcionesPorCategoria(categoria).visibilidades.some((v) => v === visibilidad);
}

export function esRagPermitido(categoria: string, procesarEnRag: boolean): boolean {
  return !procesarEnRag || opcionesPorCategoria(categoria).admiteRag;
}

/**
 * Valores de visibilidad y RAG tras elegir otra categoría: conserva la visibilidad si
 * sigue permitida (si no, preselecciona la única opción o la deja vacía) y apaga el RAG
 * si la nueva categoría no lo admite.
 */
export function ajustarAlCambiarCategoria(
  categoria: string,
  actual: { visibilidadDefecto: string; procesarEnRag: boolean },
): { visibilidadDefecto: string; procesarEnRag: boolean } {
  const opciones = opcionesPorCategoria(categoria);
  return {
    visibilidadDefecto: esVisibilidadPermitida(categoria, actual.visibilidadDefecto)
      ? actual.visibilidadDefecto
      : opciones.visibilidadPorDefecto,
    procesarEnRag: opciones.admiteRag && actual.procesarEnRag,
  };
}

/**
 * Opciones del selector de visibilidad. En edición, si el tipo trae una visibilidad que
 * la categoría ya no admite, se agrega marcada como inválida para que se siga viendo; deja
 * de figurar apenas se elige una permitida. En el alta nunca se agrega.
 */
export function opcionesVisibilidad(
  categoria: string,
  visibilidadSeleccionada: string,
  esEdicion: boolean,
): OpcionVisibilidad[] {
  const opciones: OpcionVisibilidad[] = opcionesPorCategoria(categoria).visibilidades.map(
    (valor) => ({ valor, invalida: false }),
  );
  if (
    esEdicion &&
    visibilidadSeleccionada &&
    !esVisibilidadPermitida(categoria, visibilidadSeleccionada)
  ) {
    opciones.push({ valor: visibilidadSeleccionada, invalida: true });
  }
  return opciones;
}

/**
 * El switch de RAG se deshabilita si la categoría no lo admite, salvo que esté encendido
 * (configuración vieja): en ese caso queda habilitado solo para poder apagarlo.
 */
export function switchRagDeshabilitado(categoria: string, procesarEnRag: boolean): boolean {
  return !opcionesPorCategoria(categoria).admiteRag && !procesarEnRag;
}

/** "admite visibilidad Empleado y no permite procesamiento en RAG", para avisos. */
export function describirRegla(categoria: string): string {
  const { visibilidades, admiteRag } = opcionesPorCategoria(categoria);
  const etiquetas = visibilidades
    .map((v) => VISIBILIDAD_LABELS[v]?.label ?? v)
    .join(" o ");
  return `admite visibilidad ${etiquetas || "ninguna"} y ${
    admiteRag ? "permite" : "no permite"
  } procesamiento en RAG`;
}
