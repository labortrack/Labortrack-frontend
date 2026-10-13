import type { EstadoAsistencia, TipoAsistencia } from "@/features/asistencia/types/asistencia.types";
import type { EstadoJornadaTrabajo, TipoJornada } from "./planTrabajo.types";

export interface MiJornadaResumen {
  id: number;
  fecha: string;
  obraId: number;
  obraNombre: string;
  cuadrillaId: number;
  cuadrillaNombre: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  tipo: TipoJornada;
  estado: EstadoJornadaTrabajo;
  extraordinaria: boolean;
  estadoAsistencia: EstadoAsistencia | null;
  noRequiereAsistencia: boolean;
}

export interface ConsultaMisJornadasResponse {
  jornadaDestacada: MiJornadaResumen | null;
  jornadas: MiJornadaResumen[];
  mensaje: string | null;
}

export interface MiJornadaRegistro {
  fechaHora: string;
  tipo: TipoAsistencia;
}

export interface MiJornadaDetalle extends MiJornadaResumen {
  ingreso: MiJornadaRegistro | null;
  egreso: MiJornadaRegistro | null;
}

export interface MisJornadasRango {
  fechaDesde: string;
  fechaHasta: string;
}
