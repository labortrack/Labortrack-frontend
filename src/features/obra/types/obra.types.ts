export interface CapatazResponseDto {
  idEmpleadoGrupo: number;
  idEmpleado: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  telefono: string;
}

export interface AsignarCapatazRequestDto {
  idCapataz: number;
}

export interface ObraResponseDto {
  id: number;
  nombreObra: string;
  nomenclatura: string;
  pais: string;
  provincia: string;
  localidad: string;
  estadoActual: string;
  fechaInicioEstadoActual?: string;
  capataz?: CapatazResponseDto | null;
}

export interface CreateObraDto {
  nombreObra: string;
  nomenclatura: string;
  pais: string;
  provincia: string;
  localidad: string;
  motivoCambio: string;
  idCapataz: number;
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

export interface QrObraResponseDto {
  obraId: number;
  nombreObra: string;
  tokenQr: string;
  venceEn: string;
}

// Alias for convenience across components
export type Obra = ObraResponseDto;
