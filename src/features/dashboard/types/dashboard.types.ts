export interface ConteoEstadoCuadrillaDto {
  estado: string;
  cantidad: number;
}

export interface ConteoPersonalObraDto {
  obraId: number;
  nombreObra: string;
  cantidad: number;
}

export interface DashboardResumenResponseDto {
  totalEmpleadosActivos: number;
  totalObrasActivas: number;
  asistenciaHoyPorcentaje: number;
  ausenciasHoy: number;
  cuadrillasPorEstado: ConteoEstadoCuadrillaDto[];
  personalPorObra: ConteoPersonalObraDto[];
}

export interface TendenciaAsistenciaPuntoDto {
  fecha: string;
  presentes: number;
  ausentes: number;
}
