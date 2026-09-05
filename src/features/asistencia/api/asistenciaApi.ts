import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  AsistenciaDetalleResponseDto,
  AsistenciaHistorialResponseDto,
  AsistenciaHoyResponseDto,
  AsistenciaOperativaDetalleResponseDto,
  CapacidadesAsistenciaResponseDto,
  ConfirmacionEgresoQrResponseDto,
  ConfirmacionIngresoQrResponseDto,
  ConfirmarQrRequestDto,
  PeriodoDisponibleAsistenciaResponseDto,
  OpcionesFiltroAsistenciaResponseDto,
  ParteDiarioFiltros,
  ParteDiarioResponseDto,
  RegistrarEgresoManualRequestDto,
  RegistrarIngresoManualRequestDto,
  RegistroEgresoManualResponseDto,
  RegistroIngresoManualResponseDto,
  ValidarQrRequestDto,
} from "../types/asistencia.types";
import type { SpringPage } from "@/shared/types/pagination.types";

const BASE_URL = "/api/asistencias";

export const asistenciaApi = {
  getCapacidades: async () =>
    (
      await httpClient.get<CapacidadesAsistenciaResponseDto>(
        `${BASE_URL}/capacidades`,
      )
    ).data,

  getAsistenciaHoy: async (): Promise<AsistenciaHoyResponseDto | null> => {
    const response = await httpClient.get<AsistenciaHoyResponseDto | null>(
      `${BASE_URL}/mias/hoy`,
    );

    return response.status === 204 ? null : response.data;
  },

  getHistorial: async (
    mes: number,
    anio: number,
    page: number,
    size: number,
  ) =>
    (
      await httpClient.get<SpringPage<AsistenciaHistorialResponseDto>>(
        `${BASE_URL}/mias/historial`,
        { params: { mes, anio, page, size } },
      )
    ).data,

  getPeriodoDisponible: async () =>
    (
      await httpClient.get<PeriodoDisponibleAsistenciaResponseDto>(
        `${BASE_URL}/mias/periodo-disponible`,
      )
    ).data,

  getDetallePropio: async (asistenciaId: number) =>
    (
      await httpClient.get<AsistenciaDetalleResponseDto>(
        `${BASE_URL}/mias/${asistenciaId}`,
      )
    ).data,

  validarIngresoQr: async (request: ValidarQrRequestDto) =>
    (
      await httpClient.post<ConfirmacionIngresoQrResponseDto>(
        `${BASE_URL}/mias/ingreso-qr/validar`,
        request,
      )
    ).data,

  confirmarIngresoQr: async (request: ConfirmarQrRequestDto) =>
    (
      await httpClient.post<AsistenciaHoyResponseDto>(
        `${BASE_URL}/mias/ingreso-qr/confirmar`,
        request,
      )
    ).data,

  validarEgresoQr: async (request: ValidarQrRequestDto) =>
    (
      await httpClient.post<ConfirmacionEgresoQrResponseDto>(
        `${BASE_URL}/mias/egreso-qr/validar`,
        request,
      )
    ).data,

  confirmarEgresoQr: async (request: ConfirmarQrRequestDto) =>
    (
      await httpClient.post<AsistenciaHoyResponseDto>(
        `${BASE_URL}/mias/egreso-qr/confirmar`,
        request,
      )
    ).data,

  getParteDiario: async (filtros: ParteDiarioFiltros) =>
    (
      await httpClient.get<ParteDiarioResponseDto>(BASE_URL, {
        params: filtros,
      })
    ).data,

  getOpcionesFiltro: async (fecha: string) =>
    (
      await httpClient.get<OpcionesFiltroAsistenciaResponseDto>(
        `${BASE_URL}/opciones-filtro`,
        { params: { fecha } },
      )
    ).data,

  getDetalleOperativo: async (asistenciaId: number) =>
    (
      await httpClient.get<AsistenciaOperativaDetalleResponseDto>(
        `${BASE_URL}/${asistenciaId}`,
      )
    ).data,

  registrarIngresoManual: async (
    asistenciaId: number,
    request: RegistrarIngresoManualRequestDto,
  ) =>
    (
      await httpClient.post<RegistroIngresoManualResponseDto>(
        `${BASE_URL}/${asistenciaId}/ingreso-manual`,
        request,
      )
    ).data,

  registrarEgresoManual: async (
    asistenciaId: number,
    request: RegistrarEgresoManualRequestDto,
  ) =>
    (
      await httpClient.post<RegistroEgresoManualResponseDto>(
        `${BASE_URL}/${asistenciaId}/egreso-manual`,
        request,
      )
    ).data,
};
