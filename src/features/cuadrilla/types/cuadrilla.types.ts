export type EstadoCuadrilla =
  | "PLANIFICADA"
  | "EN_ESPERA"
  | "ACTIVA"
  | "FINALIZADA"
  | "SUSPENDIDA";

export interface ObraSimpleDto {
  id: number;
  nombreObra: string;
  nomenclatura: string;
  localidad?: string;
  provincia?: string;
}

export interface GrupoResponseDto {
  id: number;
  tipoActividad: string;
  activo: boolean;
}

export interface LiderCuadrillaResponseDto {
  idEmpleado: number;
  nombre: string;
  apellido: string;
  email: string;
  descripcionActividad?: string;
  fechaAsignacion?: string;
}

export interface CuadrillaResponseDto {
  id: number;
  nombre: string;
  estadoActual: EstadoCuadrilla;
  fechaInicioEstadoActual?: string;
  obra: ObraSimpleDto;
  grupo: GrupoResponseDto;
  lider?: LiderCuadrillaResponseDto | null;
  operariosCount: number;
}

export interface AltaCuadrillaRequestDto {
  nombre: string;
  idObra: number;
  idGrupo: number;
}

export interface ModificarCuadrillaRequestDto {
  nombre: string;
  idObra: number;
}

export interface LiderCuadrillaRequestDto {
  cuadrillaId: number;
  empleadoId: number;
}

export interface EmpleadoGrupoCuadrillaResponseDto {
  id: number;
  descripcionActividad: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string | null;
  empleadoGrupoId: number;
  empleadoId: number;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  cuadrillaId: number;
  nombreCuadrilla: string;
  fechaAlta: string;
  fechaBaja?: string | null;
}

export interface AltaEmpleadoGrupoCuadrillaRequestDto {
  descripcionActividad: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta: string;
  empleadoGrupoId: number;
  cuadrillaId: number;
}

export interface BajaEmpleadoGrupoCuadrillaRequestDto {
  cuadrillaId: number;
  fechaBaja?: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
