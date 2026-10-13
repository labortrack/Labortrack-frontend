import type {
  BaseImponible,
  TipoConcepto,
} from "@/features/recibos/types/parametrosLiquidables.types";

export interface ConceptoAdicionalResponseDto {
  id: number;
  nombreConceptoAdicional: string;
  descripcionConceptoAdicional: string;
  valorConcepto: number;
  remunerativo: boolean;
  isGeneral: boolean;
  tipoConcepto: TipoConcepto;
  baseImponible: BaseImponible;
  vigente: boolean;
}

export interface ConceptoAdicionalRequestDto {
  nombreConceptoAdicional: string;
  descripcionConceptoAdicional: string;
  valorConcepto: number;
  remunerativo: boolean;
  isGeneral: boolean;
  tipoConcepto: TipoConcepto;
  baseImponible: BaseImponible;
}

export type TabFiltroConcepto = "Todos" | "Activos" | "Inactivos";
