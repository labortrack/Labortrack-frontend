import type { SpringPage } from "@/shared/types/pagination.types";
import type { DecisionDiaNoLaborable, EstadoJornadaTrabajo, TipoJornada } from "./planTrabajo.types";

export interface JornadaResumen {
  id: number;
  planTrabajoId: number;
  obraId: number;
  obraNombre: string;
  cuadrillaId: number;
  cuadrillaNombre: string;
  fecha: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  tipo: TipoJornada;
  estado: EstadoJornadaTrabajo;
  extraordinaria: boolean;
  decisionDiaNoLaborable: DecisionDiaNoLaborable;
}

export interface JornadaFiltros {
  obraId?: number;
  cuadrillaId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: TipoJornada;
  estado?: EstadoJornadaTrabajo;
  extraordinaria?: boolean;
  page?: number;
  size?: number;
}

export interface ConsultaJornadasResponse {
  jornadas: SpringPage<JornadaResumen>;
  mensaje: string | null;
}

export interface JornadaDetalle extends JornadaResumen {
  resumenAsistencias: {
    totalEsperadas: number;
    pendientesIngreso: number;
    presentes: number;
    egresadas: number;
    ausentes: number;
    ausenciasJustificadas: number;
    noTrabajadasComputables: number;
    anuladas: number;
  };
  puedeConsultarParteDiario: boolean;
  puedeModificarHoraInicio: boolean;
  puedeModificarHoraFin: boolean;
  accionesDisponibles: Array<"MODIFICAR_HORARIO" | "DEFINIR_DECISION_DIA_NO_LABORABLE" | "ANULAR_JORNADA">;
  anulacion: null | {
    motivo: string;
    fechaHora: string;
    usuarioResponsableId: number | null;
    usuarioResponsable: string | null;
    totalAsistenciasAfectadas: number;
  };
}
