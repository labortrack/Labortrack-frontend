import type { SpringPage } from "@/shared/types/pagination.types";

export type PaginatedResponse<T> = SpringPage<T>;
export type { SpringPage };

export interface EmpleadoReferencia {
  id: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  cuil?: string;
  [key: string]: unknown;
}

export interface EppReferencia {
  id: number;
  nombreEPP?: string;
  stockEPP?: number;
  activo?: boolean;
  [key: string]: unknown;
}

export interface Epp {
  id: number;
  nombreEPP: string;
  stockEPP: number;
  activo: boolean;
}

export interface EntregaEpp {
  id?: number;
  idEpp: number;
  nombreEpp: string;
  idEmpleado: number;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  cantidadEntregada: number;
  fechaEntrega: string;
}

// ─── DTOs para Peticiones ───────────────────────────────────────────────────

export interface AltaEppDto {
  nombreEPP: string;
  stockEPP: number;
}

export interface ModificarEppDto {
  nombreEPP: string;
  stockEPP?: number;
}

export interface ReponerEppDto {
  cantidadReponer: number;
}

export interface NuevaEntregaDto {
  empleadoId: number;
  eppId: number;
  cantidadEntregada: number;
  fechaEntrega: string;
}
