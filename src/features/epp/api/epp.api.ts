import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  AltaEppDto,
  Epp,
  ModificarEppDto,
  NuevoRemitoDto,
  PaginatedResponse,
  Remito,
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
 * Registra un remito de entrega de EPP con todos sus ítems.
 * POST /epp/remitos
 */
export const registrarRemito = async (payload: NuevoRemitoDto): Promise<Remito> => {
  const { data } = await httpClient.post<Remito>("/epp/remitos", payload);
  return data;
};

/**
 * Descarga el PDF de un remito. La primera apertura lo genera y puede tardar unos segundos.
 * GET /epp/remitos/{id}/pdf
 */
export const getRemitoPdf = async (id: number): Promise<Blob> => {
  const { data } = await httpClient.get<Blob>(`/epp/remitos/${id}/pdf`, {
    responseType: "blob",
  });
  return data;
};

/**
 * Obtiene el historial global paginado de remitos de EPP.
 * GET /epp/remitos/paginadas?page=0&size=10
 */
export const getRemitosPaginados = async (
  page = 0,
  size = 10,
): Promise<PaginatedResponse<Remito>> => {
  const { data } = await httpClient.get<PaginatedResponse<Remito>>(
    "/epp/remitos/paginadas",
    {
      params: { page, size },
    },
  );
  return data;
};

/**
 * Obtiene los remitos de EPP del usuario autenticado en sesión.
 * GET /epp/remitos/mios
 */
export const getMisRemitos = async (): Promise<Remito[]> => {
  const { data } = await httpClient.get<Remito[]>("/epp/remitos/mios");
  return data;
};

export const eppApi = {
  getEpps,
  createEpp,
  updateEpp,
  bajaEpp,
  activarEpp,
  reponerStockEpp,
  registrarRemito,
  getRemitoPdf,
  getRemitosPaginados,
  getMisRemitos,
};
