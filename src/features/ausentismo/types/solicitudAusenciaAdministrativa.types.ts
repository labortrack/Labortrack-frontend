import type { SolicitudAusenciaDetalle, SolicitudAusenciaResumen, SolicitudesAusenciaFiltros } from "./solicitudAusencia.types";

export type AccionAdministrativaAusencia = "aceptar" | "rechazar" | "revocar";
export interface EmpleadoSolicitudAusencia { id: number; nombre: string; apellido: string }
export interface SolicitudAusenciaAdministrativaResumen extends SolicitudAusenciaResumen {
  empleado: EmpleadoSolicitudAusencia;
  tieneDocumentacionAdjunta: boolean;
}
export interface SolicitudAusenciaAdministrativaDetalle extends SolicitudAusenciaDetalle {
  empleado: EmpleadoSolicitudAusencia;
}
export interface SolicitudesAusenciaAdministrativasFiltros extends SolicitudesAusenciaFiltros {
  empleado?: string;
  obraId?: number;
  cuadrillaId?: number;
}


export interface OpcionUbicacionAusencia { id: number; nombre: string }
export interface OpcionesUbicacionAusencia { obras: OpcionUbicacionAusencia[]; cuadrillas: OpcionUbicacionAusencia[] }
