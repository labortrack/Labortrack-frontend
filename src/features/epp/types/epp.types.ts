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

export interface ItemRemito {
  eppId: number;
  nombreEpp: string;
  cantidad: number;
}

/** Remito de entrega de EPP. El id es el número del remito. */
export interface Remito {
  id: number;
  empleadoId: number;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  fechaEntrega: string;
  /** Null en los remitos migrados de entregas anteriores a guardar el responsable. */
  responsable: string | null;
  items: ItemRemito[];
  /** Si es false, el PDF se genera la primera vez que se abre (puede tardar unos segundos). */
  pdfGenerado: boolean;
}

// ─── DTOs para Peticiones ───────────────────────────────────────────────────

export interface AltaEppDto {
  nombreEPP: string;
  stockEPP: number;
}

export interface ModificarEppDto {
  nombreEPP: string;
}

export interface ReponerEppDto {
  cantidadReponer: number;
}

export interface ItemRemitoDto {
  eppId: number;
  cantidad: number;
}

export interface NuevoRemitoDto {
  empleadoId: number;
  fechaEntrega?: string;
  items: ItemRemitoDto[];
}
