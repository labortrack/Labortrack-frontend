export type Genero = "MASCULINO" | "FEMENINO" | "OTRO";

// ─── Request DTOs ────────────────────────────────────────────────────────────

export interface CreateUsuarioRequestDto {
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rol?: string;
}

export interface EmpleadoDto {
  dni: string;
  cuil: string;
  fechaNacimiento: string; // YYYY-MM-DD
  nacionalidad: string;
  grupoSanguineo: string;
  domicilio: string;
  numeroCelular: string;
  nombreContactoEmergencia: string;
  celularContactoEmergencia: string;
  numeroIeric: string;
  fechaIngreso: string; // YYYY-MM-DD
  genero: Genero;
  usuario: CreateUsuarioRequestDto;
}

export interface EmpleadoUpdateDto {
  nacionalidad?: string;
  domicilio?: string;
  numeroCelular?: string;
  nombreContactoEmergencia?: string;
  celularContactoEmergencia?: string;
  categoriaUocraId?: number;
}

export interface EmpleadoBajaDto {
  fechaBaja: string; // YYYY-MM-DD
  motivo: string;
}

export interface ReactivarLegajoRequestDto {
  motivo: string;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface EmpleadoResumenResponseDto {
  id: number;
  apellido: string;
  nombre: string;
  dni: string;
  cuil: string;
  numeroIeric: string;
  email: string;
  numeroCelular: string;
  categoriaActual: string;
  estadoActual: string;
  fotoPerfilKey: string;
  fechaIngreso: string;
}

export interface EmpleadoResponseDto {
  id: number;
  apellido: string;
  nombre: string;
  cuil: string;
  dni: string;
  numeroIeric: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  email: string;
  grupoSanguineo: string;
  nacionalidad: string;
  domicilio: string;
  numeroCelular: string;
  nombreContactoEmergencia: string;
  celularContactoEmergencia: string;
  genero: Genero;
  fotoPerfilKey: string;
  estadoActual: string;
  categoriaActual: string;
  categoriaUocraId?: number;
}

export interface EmpleadoEstadoResponseDto {
  id: number;
  nombreEstado: string;
  fechaDesde: string;
  fechaHasta: string | null;
  motivo: string;
}

// ─── Paginación (Spring Boot Page<T>) ────────────────────────────────────────

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 0-indexed
}

// ─── Parámetros de filtrado para el listado paginado ─────────────────────────

export interface EmpleadoFilterParams {
  buscar?: string;
  estado?: string;
  categoria?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ─── Labels de presentación ──────────────────────────────────────────────────

export const CATEGORIA_LABELS: Record<string, string> = {
  OFICIAL_ESPECIALIZADO: "Oficial Especializado",
  OFICIAL: "Oficial",
  MEDIO_OFICIAL: "Medio Oficial",
  PEON: "Peón",
  AYUDANTE: "Ayudante",
};

export const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  EN_OBRA: "En Obra",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
  LICENCIA: "Licencia",
};

export const GENERO_LABELS: Record<Genero, string> = {
  MASCULINO: "Masculino",
  FEMENINO: "Femenino",
  OTRO: "Otro",
};
