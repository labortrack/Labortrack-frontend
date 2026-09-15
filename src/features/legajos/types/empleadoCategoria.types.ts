export interface EmpleadoCategoriaResponseDto {
  id: number;
  fechaDesde: string;
  fechaHasta: string | null;
  empleadoId: number;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  categoriaUOCRAId: number;
  nombreCategoria: string;
  zonaId: number;
  nombreZona: string;
}

export interface EmpleadoCategoriaRequestDto {
  idEmpleado: number;
  idCategoriaUocra: number;
  idZona: number;
}
