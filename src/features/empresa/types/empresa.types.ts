export type Rubro =
  | "VIALIDAD_Y_PAVIMENTOS"
  | "OBRAS_HIDRAULICAS_Y_SANEAMIENTO"
  | "ARQUITECTURA_Y_EDIFICIOS"
  | "MOVIMIENTO_DE_SUELOS_Y_EXCAVACIONES"
  | "PUENTES_Y_ESTRUCTURAS_DE_HORMIGON"
  | "MONTAJE_INDUSTRIAL_Y_ESTRUCTURAS_METALICAS"
  | "INSTALACIONES_ELECTROMECANICAS"
  | "REDES_DE_SERVICIOS"
  | "OBRAS_DE_URBANIZACION";

export interface EmpresaResponseDto {
  id: number;
  nombreEmpresa: string | null;
  razonSocial: string;
  cuit: string;
  direccionEmpresa: string;
  emailEmpresa: string;
  nroIericEmpresa: string;
  urlLogotipoEmpresa: string | null;
  rubros: Rubro[];
}

export type Empresa = EmpresaResponseDto;

export interface EmpresaDto {
  nombreEmpresa?: string;
  razonSocial: string;
  cuit: string;
  direccionEmpresa: string;
  emailEmpresa: string;
  nroIericEmpresa: string;
  rubros: Rubro[];
}

export interface EmpresaModificacionDto {
  nombreEmpresa?: string;
  direccionEmpresa: string;
  emailEmpresa: string;
  nroIericEmpresa: string;
  rubros: Rubro[];
}
