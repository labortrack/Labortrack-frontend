import type {
  BaseImponible,
  TipoConcepto,
} from "@/features/recibos/types/parametrosLiquidables.types";

export interface DeduccionResponseDto {
  id: number;
  nombreDeduccion: string;
  descripcionDeduccion: string;
  valorDeduccion: number;
  isGeneral: boolean;
  tipoConcepto: TipoConcepto;
  baseImponible: BaseImponible;
  vigente: boolean;
}

export interface DeduccionRequestDto {
  nombreDeduccion: string;
  descripcionDeduccion: string;
  valorDeduccion: number;
  isGeneral: boolean;
  tipoConcepto: TipoConcepto;
  baseImponible: BaseImponible;
}

export type TabFiltroDeduccion = "Todas" | "Activas" | "Inactivas";
