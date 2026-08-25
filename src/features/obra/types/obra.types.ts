export interface ObraResponseDto {
  id: number;
  nombreObra: string;
  nomenclatura: string;
  pais: string;
  provincia: string;
  localidad: string;
  estadoActual: string;
  fechaInicioEstadoActual?: string;
}

export interface CreateObraDto {
  nombreObra: string;
  nomenclatura: string;
  pais: string;
  provincia: string;
  localidad: string;
  motivoCambio: string;
}

export interface ModifyObraRequestDto {
  nombreObra: string;
  pais: string;
  provincia: string;
  localidad: string;
}

export interface BajaObraRequestDto {
  motivoCambio: string;
}

export interface TransicionarEstadoObraDto {
  idEstadoObra: number;
  motivoCambio: string;
}

export interface HistorialEstadoObraDto {
  id: number;
  idEstadoObra: number;
  nombreEstadoObra: string;
  fechaDesde: string;
  fechaHasta?: string | null;
  motivoCambio: string;
}

// Alias for convenience across components
export type Obra = ObraResponseDto;
