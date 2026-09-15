import type { ZonaResponseDto } from "./zona.types";

export interface CeldaCuadroDto {
  idCategoriaZona: number;
  idZona: number;
  sumaNoRemunerativa: number;
  valorHoraAdicional: number;
}

export interface FilaCuadroDto {
  idCategoria: number;
  nombreCategoria: string;
  valorHoraBasico: number;
  celdas: CeldaCuadroDto[];
}

export interface CuadroTarifarioDto {
  zonas: ZonaResponseDto[];
  filas: FilaCuadroDto[];
}
