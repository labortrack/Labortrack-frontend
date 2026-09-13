import type { TipoSolicitudAusenciaReglas } from "./tipoSolicitudAusencia.types";
import type { EstadoJornadaTrabajo, TipoJornada } from "@/features/asistencia/types/asistencia.types";

export type EstadoSolicitudAusencia = "EN_REVISION" | "ACEPTADA" | "RECHAZADA" | "REVOCADA";
export interface TipoAusenciaOpcion { id: number; nombre: string }
export interface TipoAusenciaDisponible extends TipoSolicitudAusenciaReglas { id: number }
export interface SolicitudAusenciaResumen {
  id: number;
  tipoSolicitud: string;
  fechaDesde: string;
  fechaHasta: string;
  cantidadDias: number;
  estado: EstadoSolicitudAusencia;
  fechaHoraSolicitud: string;
  accionesDisponibles: string[];
}
export interface DocumentoAusencia {
  id: number;
  nombre: string;
  nombreArchivoOriginal: string;
  contentType: string;
  fechaSubida: string;
}
export interface JornadaAusencia {
  id: number;
  fecha: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  tipoJornada: TipoJornada;
  estado: EstadoJornadaTrabajo;
  cuadrilla: string;
  obra: string;
}
export interface EstadoAusenciaHistorial {
  estado: EstadoSolicitudAusencia;
  fechaHoraDesde: string;
  fechaHoraHasta: string | null;
  motivo: string | null;
}
export interface SolicitudAusenciaDetalle extends Omit<SolicitudAusenciaResumen, "tipoSolicitud"> {
  tipoSolicitud: TipoSolicitudAusenciaReglas;
  motivo: string;
  documentos: DocumentoAusencia[];
  jornadas: JornadaAusencia[];
  historialEstados: EstadoAusenciaHistorial[];
}
export interface CrearSolicitudAusencia {
  tipoSolicitudAusenciaId: number;
  fechaDesde: string;
  fechaHasta: string;
  motivo: string;
}
export interface SolicitudAusenciaCreada extends Omit<CrearSolicitudAusencia, "tipoSolicitudAusenciaId"> {
  tipoSolicitud: string;
  estado: EstadoSolicitudAusencia;
  cantidadDias: number;
  fechaHoraSolicitud: string;
  cantidadJornadasAsociadas: number;
  seDetectaronJornadas: boolean;
  cantidadDocumentosAdjuntos: number;
}
export interface SolicitudesAusenciaFiltros {
  estado?: EstadoSolicitudAusencia;
  tipoSolicitudAusenciaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page: number;
}
