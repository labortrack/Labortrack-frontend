export interface ZonaResponseDto {
  id: number;
  nombreZona: string;
  activo: boolean;
}

export interface ZonaRequestDto {
  nombreZona: string;
}

export type TabFiltroZona = "Todos" | "Activos" | "Inactivos";
