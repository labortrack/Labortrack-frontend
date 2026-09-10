export type TipoLiquidacion = "POR_HORA" | "MENSUAL";

export interface CategoriaUocraResponseDto {
  id: number;
  nombreCategoria: string;
  valorHoraBasico: number;
  tipoLiquidacion: TipoLiquidacion;
  activo: boolean;
}

export interface CategoriaUocraRequestDto {
  nombreCategoria: string;
  tipoLiquidacion: TipoLiquidacion;
  valorHoraBasico: number;
}

export type TabFiltroCategoriaUocra = "Todos" | "Activos" | "Inactivos";
