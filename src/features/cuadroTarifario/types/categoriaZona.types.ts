export interface CategoriaZonaResponseDto {
  id: number;
  sumaNoRemunerativa: number;
  valorHoraAdicional: number;
  zonaId: number;
  nombreZona: string;
  categoriaUOCRAId: number;
  nombreCategoria: string;
  activo: boolean;
}

export interface CategoriaZonaRequestDto {
  valorHoraAdicional: number;
  sumaNoRemunerativa: number;
  idZona: number;
  idCategoriaUOCRA: number;
}

export type TabFiltroCategoriaZona = "Todos" | "Activos" | "Inactivos";
