import type { RolNombre } from "@/features/auth/types/auth.types";

export type { RolNombre };

export interface UserResponseDto {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolNombre;
}

export interface CreateUsuarioRequestDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: RolNombre;
}

export interface ModifyUserRequestDto { nombre: string; apellido: string }
export interface UsuarioBajaDto { motivo: string; fechaBaja: string }
export interface UsuarioFilterDto { nombre?: string; apellido?: string; email?: string; rol?: RolNombre | ""; enabled?: boolean }
export interface PageableParams { page: number; size: number; sort: string }

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
