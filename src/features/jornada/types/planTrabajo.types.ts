import type { SpringPage } from "@/shared/types/pagination.types";
import type { EstadoCuadrilla } from "@/features/cuadrilla/types/cuadrilla.types";

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
  | "CREAR_JORNADA_EXTRAORDINARIA"
  | "CANCELAR_PLAN_TRABAJO"
  | "FINALIZAR_PLAN_TRABAJO_ANTICIPADAMENTE";

export type TipoCierrePlanTrabajo =
  | "CANCELACION"
  | "FINALIZACION_ANTICIPADA";

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

export type JornadaTrabajoProgramadaResponseDto = Omit<
  JornadaPlanTrabajoResponseDto,
  "extraordinaria"
>;

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
  tipoCierre: TipoCierrePlanTrabajo | null;
  motivoCierre: string | null;
  fechaHoraCierre: string | null;
  usuarioResponsableCierreId: number | null;
  usuarioResponsableCierreNombre: string | null;
  fechaVigenciaHastaOriginal: string | null;
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

export interface GuardarPlanTrabajoRequestDto {
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  dias: DiaSemana[];
}

export type CrearPlanTrabajoRequestDto = GuardarPlanTrabajoRequestDto;
export type ModificarPlanTrabajoRequestDto = GuardarPlanTrabajoRequestDto;

export interface PlanTrabajoCuadrillaResponseDto {
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
  estadoCuadrilla: EstadoCuadrilla;
  cantidadJornadas: number;
  jornadas: JornadaTrabajoProgramadaResponseDto[];
}

export interface ModificarPlanTrabajoResponseDto {
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
  estado: EstadoCalculadoPlanTrabajo;
  jornadasActualizadas: number;
  jornadasCreadas: number;
  jornadasAnuladas: number;
  mensaje: string;
}

export interface CrearJornadaExtraordinariaRequestDto {
  fecha: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
}

export interface CrearJornadaExtraordinariaResponseDto {
  id: number;
  planTrabajoId: number;
  cuadrillaId: number;
  cuadrillaNombre: string;
  obraId: number;
  obraNombre: string;
  fecha: string;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  tipo: TipoJornada;
  decisionDiaNoLaborable: DecisionDiaNoLaborable;
  estado: EstadoJornadaTrabajo;
  extraordinaria: boolean;
  asistenciasGeneradas: number;
  mensaje: string;
}

export interface CerrarPlanTrabajoRequestDto {
  motivo: string;
}

export interface CerrarPlanTrabajoResponseDto {
  planId: number;
  tipoCierre: TipoCierrePlanTrabajo;
  fechaVigenciaHasta: string;
  fechaVigenciaHastaOriginal: string | null;
  fechaHoraCierre: string;
  jornadasAnuladas: number;
  asistenciasAnuladas: number;
  estadoCuadrilla: EstadoCuadrilla;
  mensaje: string;
}
