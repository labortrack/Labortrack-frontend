export type TipoAlcanceDashboard = "GLOBAL" | "OBRA" | "CUADRILLA" | "PERSONAL";

export interface ConteoEstadoCuadrillaDto {
  estado: string;
  cantidad: number;
}

export interface ConteoPersonalObraDto {
  obraId: number;
  nombreObra: string;
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

export interface CuadrillaLideradaDto {
  cuadrillaId: number;
  nombreCuadrilla: string;
  nombreObra: string;
  estadoActual: string | null;
  personalVigente: number;
}

export interface ResumenCuadrillaDto {
  misCuadrillas: CuadrillaLideradaDto[];
  asistenciaHoyPorcentaje: number;
  ausentesHoy: number;
  totalPersonalVigente: number;
}

export interface MiAsignacionActualDto {
  nombreObra: string;
  nombreCuadrilla: string;
  tipoActividad: string;
  desde: string;
}

export interface ResumenPersonalDto {
  asignacionActual: MiAsignacionActualDto | null;
  presentesMes: number;
  ausentesMes: number;
  solicitudesAusenciaPendientes: number;
}

export interface DashboardResumenResponseDto {
  tipoAlcance: TipoAlcanceDashboard;
  organizacional: ResumenOrganizacionalDto | null;
  cuadrilla: ResumenCuadrillaDto | null;
  personal: ResumenPersonalDto | null;
}

export interface TendenciaAsistenciaPuntoDto {
  fecha: string;
  presentes: number;
  ausentes: number;
}
