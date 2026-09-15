export interface GrupoResponseDto {
  id: number;
  tipoActividad: string;
  activo: boolean;
}

export interface GrupoRequestDto {
  tipoActividad: string;
}

export interface GrupoFilterDto {
  tipoActividad?: string;
  activo?: boolean;
}

export interface EmpleadoGrupoResponseDto {
  id: number;
  fechaDesdeEmpleadoGrupo: string;
  fechaHastaEmpleadoGrupo: string | null;
  empleadoId: number;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  dniEmpleado: string;
  grupoId: number;
  tipoActividad: string;
}

export interface EmpleadoGrupoRequestDto {
  idEmpleado: number;
  idGrupo: number;
}

export interface EmpleadoGrupoFilterDto {
  idGrupo?: number;
  busqueda?: string;
  activo?: boolean;
}

export type MainTab = "grupos" | "asignaciones";
export type TabFiltroGrupo = "Activos" | "Inactivos" | "Todos";
