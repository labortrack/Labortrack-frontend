export interface EstadoObraResponseDto {
  id: number;
  nombreEstadoObra: string;
  descripcionEstadoObra: string;
}

export interface CreateEstadoObraDto {
  nombreEstadoObra: string;
  descripcionEstadoObra: string;
}

export interface ModifyEstadoObraRequestDto {
  descripcionEstadoObra: string;
}

export type TabFiltroEstadoObra = "Todos" | "Activos" | "Inactivos";

export type EstadoObraNombre =
  | "PLANIFICADA"
  | "EN EJECUCIÓN"
  | "EN FUNDACIÓN"
  | "SUSPENDIDA"
  | "EN INSPECCIÓN"
  | "FINALIZADA"
  | "ARCHIVADA"
  | string;
