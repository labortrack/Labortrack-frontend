// Roles exactos del sistema (Enum RolNombre en Java)
export type RolNombre = "ROLE_ADMIN" | "ROLE_RRHH" | "ROLE_OPERARIO";

// DTO de respuesta
export interface UserResponseDto {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolNombre;
}

// DTO de creación
export interface CreateUsuarioRequestDto {
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  rol: RolNombre;
}

// DTO de modificación (solo nombre y apellido)
export interface ModifyUserRequestDto {
  nombre: string;
  apellido: string;
}

// DTO para dar de baja
export interface UsuarioBajaDto {
  motivo: string;
}

// DTO de filtros para búsqueda
export interface UsuarioFilterDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: RolNombre | "";
  enabled?: boolean;
}

// Paginación estándar de Spring Data
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Página actual (base 0)
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string;
}
