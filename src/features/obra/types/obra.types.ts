import type { EstadoObraNombre } from "../estado/types/estadoObra.types";

export interface Capataz {
  id: number;
  nombre: string;
  estado: "activo" | "suspendido";
}

export interface Obra {
  id: number;
  nombre: string;
  nomenclatura: string;
  pais: string;
  provincia: string;
  localidad: string;
  capatazId: number;
  capatazNombre: string;
  estado: EstadoObraNombre;
  tieneCuadrillasActivas: boolean;
}

export interface ObraFormData {
  nombre: string;
  nomenclatura: string;
  pais: string;
  provincia: string;
  localidad: string;
  capatazId: string;
}
