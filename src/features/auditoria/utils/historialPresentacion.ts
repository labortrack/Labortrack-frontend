import { CAMPOS_OCULTOS } from "../constants/entidades.constants";
import type {
  AuditoriaLogDTO,
  CambioCampoDTO,
  OperacionAuditoria,
} from "../types/auditoria.types";

/**
 * Reglas de presentación del historial de auditoría. Son funciones puras (sin React ni
 * acceso a la API) para que la línea de tiempo y la página global rotulen igual.
 *
 * Cómo arma el backend cada revisión (AuditoriaService.historial):
 * - "cambios" solo trae campos simples (texto, números, booleanos, enums y fechas):
 *   las relaciones nunca aparecen.
 * - La revisión más antigua de un registro anterior a la auditoría es una MODIFICACION sin
 *   cambios, porque no hay foto previa con la que comparar.
 * - Una MODIFICACION posterior sin cambios significa que solo cambiaron relaciones.
 * - Una ELIMINACION llega sin cambios: la foto de la baja es igual a la anterior.
 */

export type TipoFichaje = "QR" | "REGISTRO_MANUAL";

/** Variantes de Badge disponibles en la Guía Visual (src/shared/ui/badge.tsx). */
export type TonoOperacion = "success" | "primary" | "error" | "warning" | "neutral";

export type ClaseRevision =
  | "PREVIA_A_AUDITORIA"
  | "RELACIONES_SIN_DETALLE"
  | "CON_DETALLE";

const ENTIDADES_FICHAJE = new Set(["ingreso", "egreso"]);

/** Campos técnicos que solo se ocultan en las revisiones de alta. */
export const CAMPOS_OCULTOS_EN_CREACION: readonly string[] = [
  "usuarioSubidaId",
  "accountNonExpired",
  "accountNonLocked",
  "credentialsNonExpired",
] as const;

const CAMPOS_CIERRE_DE_VIGENCIA = new Set(["fechaHoraHasta", "fechaHasta"]);

export function esEntidadFichaje(entidad: string): boolean {
  return ENTIDADES_FICHAJE.has(entidad.toLowerCase());
}

/** Tablas de historial de estados: asistencia_estado, cuadrilla_estado, obra_estado, etc. */
export function esEntidadDeEstado(entidad: string): boolean {
  return entidad.toLowerCase().endsWith("_estado");
}

/** Cambios que se muestran: sin campos técnicos, y sin los propios del alta si es CREACION. */
export function cambiosVisibles(log: AuditoriaLogDTO): CambioCampoDTO[] {
  return (log.cambios ?? []).filter(
    (cambio) =>
      !CAMPOS_OCULTOS.includes(cambio.campo) &&
      !(log.operacion === "CREACION" && CAMPOS_OCULTOS_EN_CREACION.includes(cambio.campo)),
  );
}

/**
 * Clasifica una revisión según el contenido que trae el backend.
 * @param esMasAntigua true si es la primera revisión registrada del registro.
 */
export function clasificarRevision(
  log: AuditoriaLogDTO,
  esMasAntigua: boolean,
): ClaseRevision {
  if (log.operacion === "MODIFICACION" && (log.cambios ?? []).length === 0) {
    return esMasAntigua ? "PREVIA_A_AUDITORIA" : "RELACIONES_SIN_DETALLE";
  }
  return "CON_DETALLE";
}

/** true si la modificación solo cerró la vigencia de un estado (fechaHoraHasta o fechaHasta). */
export function esCierreDeVigencia(cambios: readonly CambioCampoDTO[]): boolean {
  return (
    cambios.length > 0 &&
    cambios.every((cambio) => CAMPOS_CIERRE_DE_VIGENCIA.has(cambio.campo))
  );
}

/**
 * Tipo de un Ingreso o Egreso según su historial. El tipo no cambia nunca y la revisión de
 * anulación llega sin cambios, así que se toma de la revisión que lo trae (el alta).
 */
export function tipoFichajeDelHistorial(
  logs: readonly AuditoriaLogDTO[],
): TipoFichaje | null {
  for (const log of logs) {
    for (const cambio of log.cambios ?? []) {
      if (cambio.campo !== "tipoAsistencia") continue;
      const valor = cambio.valorNuevo ?? cambio.valorAnterior;
      if (valor === "QR" || valor === "REGISTRO_MANUAL") return valor;
    }
  }
  return null;
}

export interface ContextoOperacion {
  /** Solo para Ingreso/Egreso: tipo del registro, si se conoce. */
  tipoFichaje?: TipoFichaje | null;
  /** Cambios de la revisión, si se conocen (el feed global no los trae). */
  cambios?: readonly CambioCampoDTO[];
}

/** Rótulo único de la operación, según la entidad. */
export function etiquetaOperacion(
  entidad: string,
  operacion: OperacionAuditoria,
  contexto: ContextoOperacion = {},
): string {
  if (esEntidadFichaje(entidad)) {
    switch (operacion) {
      case "CREACION":
        if (contexto.tipoFichaje === "REGISTRO_MANUAL") return "Registro manual";
        if (contexto.tipoFichaje === "QR") return "Registro QR";
        return "Registro";
      case "MODIFICACION":
        return "Modificación";
      case "ELIMINACION":
        return "Anulación";
    }
  }

  if (esEntidadDeEstado(entidad)) {
    switch (operacion) {
      case "CREACION":
        return "Nuevo estado";
      case "MODIFICACION":
        // Sin cambios disponibles (feed global): en estas tablas la única modificación
        // posterior al alta es el cierre de vigencia del estado anterior.
        if (contexto.cambios === undefined) return "Cierre de vigencia";
        return esCierreDeVigencia(contexto.cambios) ? "Cierre de vigencia" : "Modificación";
      case "ELIMINACION":
        return "Eliminación";
    }
  }

  switch (operacion) {
    case "CREACION":
      return "Alta";
    case "MODIFICACION":
      return "Modificación";
    case "ELIMINACION":
      return "Eliminación";
    default:
      return operacion;
  }
}

/**
 * Tono visual de la operación. En Ingreso/Egreso se destacan los registros manuales
 * (naranja de atención operativa) y las anulaciones (error); el fichaje QR, que es lo
 * habitual, queda en segundo plano (neutro).
 */
export function tonoOperacion(
  entidad: string,
  operacion: OperacionAuditoria,
  tipoFichaje: TipoFichaje | null = null,
): TonoOperacion {
  if (operacion === "ELIMINACION") return "error";

  if (esEntidadFichaje(entidad) && operacion === "CREACION") {
    if (tipoFichaje === "REGISTRO_MANUAL") return "warning";
    if (tipoFichaje === "QR") return "neutral";
  }

  if (operacion === "CREACION") return "success";
  if (operacion === "MODIFICACION") return "primary";
  return "neutral";
}
