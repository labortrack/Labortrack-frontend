export type EstadoTipoSolicitudAusencia = "ACTIVO" | "INACTIVO";
export type AccionTipoSolicitudAusencia = "VER_DETALLE" | "MODIFICAR" | "DESACTIVAR";

export interface TipoSolicitudAusenciaReglas {
  nombre: string;
  descripcion: string;
  maxDias: number;
  permiteRetroactiva: boolean;
  requiereDocumento: boolean;
}

export interface TipoSolicitudAusenciaResumen extends TipoSolicitudAusenciaReglas {
  id: number;
  estado: EstadoTipoSolicitudAusencia;
  accionesDisponibles: AccionTipoSolicitudAusencia[];
}

export interface TipoSolicitudAusenciaVersion extends TipoSolicitudAusenciaReglas {
  fechaHoraDesdeVigencia: string;
  fechaHoraHastaVigencia: string;
}

export interface TipoSolicitudAusenciaDetalle extends TipoSolicitudAusenciaResumen {
  fechaHoraDesdeVigencia: string;
  fechaBaja: string | null;
  versionesAnteriores: TipoSolicitudAusenciaVersion[];
}

export interface TiposSolicitudAusenciaFiltros {
  nombre?: string;
  estado?: EstadoTipoSolicitudAusencia;
  permiteRetroactiva?: boolean;
  requiereDocumento?: boolean;
  page: number;
}
