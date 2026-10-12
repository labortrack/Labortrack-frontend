import { httpClient } from "@/shared/lib/http/httpClient";
import type { SpringPage } from "@/shared/types/pagination.types";
import type {
  AvisoGlobalRequestDto,
  AvisoGlobalResponseDto,
  CantidadNoLeidasDto,
  ConfiguracionNotificacionDto,
  NotificacionDto,
  TipoNotificacion,
} from "../types/notificaciones.types";

const BASE = "/api/notificaciones";

export const getNotificaciones = async (params: {
  page: number;
  size: number;
  soloNoLeidas: boolean;
}): Promise<SpringPage<NotificacionDto>> => {
  const { data } = await httpClient.get<SpringPage<NotificacionDto>>(BASE, {
    params,
  });
  return data;
};

export const getCantidadNoLeidas = async (): Promise<CantidadNoLeidasDto> => {
  const { data } = await httpClient.get<CantidadNoLeidasDto>(
    `${BASE}/no-leidas/cantidad`,
  );
  return data;
};

export const marcarNotificacionLeida = async (id: number): Promise<void> => {
  await httpClient.patch(`${BASE}/${id}/leida`);
};

export const marcarTodasLeidas = async (): Promise<void> => {
  await httpClient.patch(`${BASE}/leidas`);
};

export const getConfiguracionNotificaciones = async (): Promise<
  ConfiguracionNotificacionDto[]
> => {
  const { data } = await httpClient.get<ConfiguracionNotificacionDto[]>(
    `${BASE}/configuracion`,
  );
  return data;
};

export const modificarConfiguracionNotificacion = async (
  tipo: TipoNotificacion,
  habilitada: boolean,
): Promise<ConfiguracionNotificacionDto> => {
  const { data } = await httpClient.patch<ConfiguracionNotificacionDto>(
    `${BASE}/configuracion/${tipo}`,
    { habilitada },
  );
  return data;
};

export const enviarAvisoGlobal = async (
  request: AvisoGlobalRequestDto,
): Promise<AvisoGlobalResponseDto> => {
  const { data } = await httpClient.post<AvisoGlobalResponseDto>(
    `${BASE}/avisos-globales`,
    request,
  );
  return data;
};
