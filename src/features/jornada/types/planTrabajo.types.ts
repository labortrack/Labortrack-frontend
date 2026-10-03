import type { SpringPage } from "@/shared/types/pagination.types";

export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

export type EstadoCalculadoPlanTrabajo =
  | "PROGRAMADO"
  | "VIGENTE"
  | "FINALIZADO";

export type TipoJornada =
  | "HABIL"
  | "SABADO"
  | "DOMINGO"
  | "FERIADO"
  | "NO_LABORABLE";

export type EstadoJornadaTrabajo =
  | "PROGRAMADA"
  | "NO_TRABAJADA"
  | "EN_CURSO"
  | "FINALIZADA"
  | "ANULADA";

export type DecisionDiaNoLaborable =
  | "NO_APLICA"
  | "SE_TRABAJA"
  | "NO_SE_TRABAJA";

export type AccionPlanTrabajo =
  | "CREAR_PLAN_TRABAJO"
  | "MODIFICAR_PLAN_TRABAJO"
  | "CREAR_JORNADA_EXTRAORDINARIA";

export interface PlanTrabajoResumenResponseDto {
  id: number;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  dias: DiaSemana[];
  estadoCalculado: EstadoCalculadoPlanTrabajo;
  cancelado: boolean;
  fechaHoraCancelacion: string | null;
}

export interface ConsultaPlanesTrabajoResponseDto {
  cuadrillaId: number;
  cuadrillaNombre: string;
  obraId: number;
  obraNombre: string;
  accionesDisponibles: AccionPlanTrabajo[];
  planes: SpringPage<PlanTrabajoResumenResponseDto>;
  mensaje: string | null;
}

export interface JornadaPlanTrabajoResponseDto {
  id: number;
  fecha: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  tipo: TipoJornada;
  decisionDiaNoLaborable: DecisionDiaNoLaborable;
  estado: EstadoJornadaTrabajo;
  extraordinaria: boolean;
}

export interface PlanTrabajoDetalleResponseDto {
  id: number;
  cuadrillaId: number;
  cuadrillaNombre: string;
  obraId: number;
  obraNombre: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  dias: DiaSemana[];
  estadoCalculado: EstadoCalculadoPlanTrabajo;
  cancelado: boolean;
  fechaHoraCancelacion: string | null;
  accionesDisponibles: AccionPlanTrabajo[];
  jornadas: SpringPage<JornadaPlanTrabajoResponseDto>;
}

export interface PlanTrabajoFiltros {
  estado?: EstadoCalculadoPlanTrabajo;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  size?: number;
}

export interface JornadaPlanFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: TipoJornada;
  estado?: EstadoJornadaTrabajo;
  page?: number;
  size?: number;
}
