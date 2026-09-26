import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  AltaEppDto,
  EntregaEpp,
  Epp,
  ModificarEppDto,
  NuevaEntregaDto,
  PaginatedResponse,
  ReponerEppDto,
} from "../types/epp.types";

/**
 * Obtiene el listado completo de elementos de protección personal (EPP).
 * GET /epp/listadoEpp
 */
export const getEpps = async (): Promise<Epp[]> => {
  const { data } = await httpClient.get<Epp[]>("/epp/listadoEpp");
  return data;
};

/**
 * Da de alta un nuevo EPP con su stock inicial.
 * POST /epp/AltaEpp
 */
export const createEpp = async (payload: AltaEppDto): Promise<Epp> => {
  const { data } = await httpClient.post<Epp>("/epp/AltaEpp", payload);
  return data;
};

/**
 * Actualiza los datos de un EPP existente por ID.
 * PUT /epp/ActualizarEpp/{id}
 */
export const updateEpp = async (
  id: number,
  payload: ModificarEppDto,
): Promise<Epp> => {
  const { data } = await httpClient.put<Epp>(`/epp/ActualizarEpp/${id}`, payload);
  return data;
};

/**
 * Da de baja (desactiva/elimina lógicamente) un EPP por ID.
 * DELETE /epp/BajaEpp/{id}
 */
export const bajaEpp = async (id: number): Promise<void> => {
  const { data } = await httpClient.delete<void>(`/epp/BajaEpp/${id}`);
  return data;
};

/**
 * Reactiva un EPP dado de baja por ID.
 * PATCH /epp/ActivarEpp/{id}
 */
export const activarEpp = async (id: number): Promise<Epp> => {
  const { data } = await httpClient.patch<Epp>(`/epp/ActivarEpp/${id}`);
  return data;
};

/**
 * Ingresa reposición de stock al pañol para un EPP por ID.
 * PUT /epp/reposicion/{id}
 */
export const reponerStockEpp = async (
  id: number,
  payload: ReponerEppDto,
): Promise<Epp> => {
  const { data } = await httpClient.put<Epp>(`/epp/reposicion/${id}`, payload);
  return data;
};

/**
 * Asigna y entrega un EPP a un empleado.
 * POST /epp/entregas
 */
export const asignarEpp = async (
  payload: NuevaEntregaDto,
): Promise<EntregaEpp> => {
  const { data } = await httpClient.post<EntregaEpp>("/epp/entregas", payload);
  return data;
};

/**
 * Obtiene el historial de entregas de EPP para un empleado específico.
 * GET /epp/entregasEmpleado/{empleadoId}
 */
export const getEntregasPorEmpleado = async (
  empleadoId: number,
): Promise<EntregaEpp[]> => {
  const { data } = await httpClient.get<EntregaEpp[]>(
    `/epp/entregasEmpleado/${empleadoId}`,
  );
  return data;
};

/**
 * Obtiene el historial global paginado de todas las entregas de EPP.
 * GET /epp/entregas/paginadas?page=0&size=10
 */
export const getEntregasPaginadas = async (
  page = 0,
  size = 10,
): Promise<PaginatedResponse<EntregaEpp>> => {
  const { data } = await httpClient.get<PaginatedResponse<EntregaEpp>>(
    "/epp/entregas/paginadas",
    {
      params: { page, size },
    },
  );
  return data;
};

/**
 * Obtiene el listado de entregas de EPP asignadas al operario autenticado en sesión.
 * GET /epp/mis-entregas
 */
export const getMisEntregas = async (): Promise<EntregaEpp[]> => {
  const { data } = await httpClient.get<EntregaEpp[]>("/epp/entregasEmpleado");
  return data;
};

export const eppApi = {
  getEpps,
  createEpp,
  updateEpp,
  bajaEpp,
  activarEpp,
  reponerStockEpp,
  asignarEpp,
  getEntregasPorEmpleado,
  getEntregasPaginadas,
  getMisEntregas,
};
