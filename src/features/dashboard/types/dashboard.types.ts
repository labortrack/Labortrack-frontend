import type { EstadoAsistencia, EstadoJornadaTrabajo } from "@/features/asistencia/types/asistencia.types";
import type { SolicitudAusenciaResumen } from "@/features/ausentismo/types/solicitudAusencia.types";

export type TipoAlcanceDashboard = "GLOBAL" | "OBRA" | "CUADRILLA" | "PERSONAL";

export interface ConteoEstadoCuadrillaDto {
  estado: string;
  cantidad: number;
}

export interface ConteoPersonalObraDto {
  obraId: number;
  nombreObra: string;
  nomenclatura: string;
  cantidad: number;
}

export interface ResumenOrganizacionalDto {
  totalEmpleadosActivos: number;
  totalObrasActivas: number;
  asistenciaHoyPorcentaje: number;
  ausenciasHoy: number;
  cuadrillasPorEstado: ConteoEstadoCuadrillaDto[];
  personalPorObra: ConteoPersonalObraDto[];
}

export interface JornadaResumenDto {
  jornadaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoJornadaTrabajo;
  extraordinaria: boolean;
}

export interface CuadrillaLideradaDto {
  cuadrillaId: number;
  nombreCuadrilla: string;
  nombreObra: string;
  estadoActual: string | null;
  personalVigente: number;
  jornadaHoy: JornadaResumenDto | null;
}

export interface PendienteFicharDto {
  asistenciaId: number;
  nombreEmpleado: string;
  nombreCuadrilla: string;
  estado: EstadoAsistencia;
}

export interface ResumenCuadrillaDto {
  misCuadrillas: CuadrillaLideradaDto[];
  asistenciaHoyPorcentaje: number;
  ausentesHoy: number;
  totalPersonalVigente: number;
  pendientesHoy: PendienteFicharDto[];
}

export interface MiAsignacionActualDto {
  nombreObra: string;
  nombreCuadrilla: string;
  tipoActividad: string;
  desde: string;
}

export interface MiJornadaDto {
  jornada: JornadaResumenDto;
  nombreCuadrilla: string;
  estadoAsistencia: EstadoAsistencia | null;
  ingreso: string | null;
  egreso: string | null;
}

export interface DiaAsistenciaDto {
  fecha: string;
  estado: EstadoAsistencia;
}

export interface ReciboResumenDto {
  documentoId: number;
  nombreDocumento: string;
  fechaSubida: string;
}

export interface EppEntregadoDto {
  nombreEpp: string;
  cantidad: number | null;
  fechaEntrega: string;
}

export interface ResumenPersonalDto {
  asignacionActual: MiAsignacionActualDto | null;
  presentesMes: number;
  ausentesMes: number;
  solicitudesAusenciaPendientes: number;
  miJornada: MiJornadaDto | null;
  asistenciasMes: DiaAsistenciaDto[];
  solicitudesRecientes: SolicitudAusenciaResumen[];
  ultimoRecibo: ReciboResumenDto | null;
  ultimosEpp: EppEntregadoDto[];
}

export interface DashboardResumenResponseDto {
  tipoAlcance: TipoAlcanceDashboard;
  organizacional: ResumenOrganizacionalDto | null;
  cuadrilla: ResumenCuadrillaDto | null;
  personal: ResumenPersonalDto | null;
}

/** Indicador de control de entrega de recibos de un período (US039). Solo ADMIN. */
export interface LecturaRecibosPeriodoDto {
  periodoLiquidacionId: number;
  descripcionPeriodo: string;
  /** yyyy-MM-dd */
  fechaDesde: string;
  fechaHasta: string;
  /** PENDIENTE_LECTURA + LEIDO */
  recibosPublicados: number;
  recibosLeidos: number;
  porcentajeLeidos: number;
}

export interface TendenciaAsistenciaPuntoDto {
  fecha: string;
  presentes: number;
  ausentes: number;
}
