import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  ReciboSueldoDetalleDto,
  ReciboSueldoGrillaDto,
  ResultadoEmisionLote,
  ResultadoImpresionLote,
  ResultadoPreLiquidacion,
} from "../types/reciboSueldo.types";

const BASE_URL = "/labortrack/reciboSueldo";

export const reciboSueldoApi = {
  listarDelPeriodo: async (
    periodoId: number,
  ): Promise<ReciboSueldoGrillaDto[]> => {
    const response = await httpClient.get<ReciboSueldoGrillaDto[]>(
      `${BASE_URL}/periodos-liquidacion/${periodoId}/recibos`,
    );
    return response.data;
  },

  obtenerDetalle: async (reciboId: number): Promise<ReciboSueldoDetalleDto> => {
    const response = await httpClient.get<ReciboSueldoDetalleDto>(
      `${BASE_URL}/recibos/${reciboId}`,
    );
    return response.data;
  },

  // ─── Ajustes sobre un recibo en BORRADOR ──────────────────────────────────
  // Todos devuelven el detalle ya recalculado.

  aplicarConcepto: async (
    reciboId: number,
    conceptoId: number,
  ): Promise<ReciboSueldoDetalleDto> => {
    const response = await httpClient.post<ReciboSueldoDetalleDto>(
      `${BASE_URL}/recibos/${reciboId}/conceptos/${conceptoId}`,
    );
    return response.data;
  },

  aplicarDeduccion: async (
    reciboId: number,
    deduccionId: number,
  ): Promise<ReciboSueldoDetalleDto> => {
    const response = await httpClient.post<ReciboSueldoDetalleDto>(
      `${BASE_URL}/recibos/${reciboId}/deducciones/${deduccionId}`,
    );
    return response.data;
  },

  quitarLinea: async (
    reciboId: number,
    detalleId: number,
  ): Promise<ReciboSueldoDetalleDto> => {
    const response = await httpClient.delete<ReciboSueldoDetalleDto>(
      `${BASE_URL}/recibos/${reciboId}/detalles/${detalleId}`,
    );
    return response.data;
  },

  regenerar: async (reciboId: number): Promise<ReciboSueldoDetalleDto> => {
    const response = await httpClient.post<ReciboSueldoDetalleDto>(
      `${BASE_URL}/recibos/${reciboId}/regeneracion`,
    );
    return response.data;
  },

  cancelar: async (
    reciboId: number,
    motivo: string,
  ): Promise<ReciboSueldoDetalleDto> => {
    const response = await httpClient.post<ReciboSueldoDetalleDto>(
      `${BASE_URL}/recibos/${reciboId}/cancelacion`,
      { motivo },
    );
    return response.data;
  },

  // ─── Emisión e impresión ──────────────────────────────────────────────────

  emitirLote: async (periodoId: number): Promise<ResultadoEmisionLote> => {
    const response = await httpClient.post<ResultadoEmisionLote>(
      `${BASE_URL}/periodos-liquidacion/${periodoId}/emision`,
    );
    return response.data;
  },

  imprimirLote: async (periodoId: number): Promise<ResultadoImpresionLote> => {
    const response = await httpClient.post<ResultadoImpresionLote>(
      `${BASE_URL}/periodos-liquidacion/${periodoId}/impresion`,
    );
    return response.data;
  },

  imprimir: async (reciboId: number): Promise<ReciboSueldoDetalleDto> => {
    const response = await httpClient.post<ReciboSueldoDetalleDto>(
      `${BASE_URL}/recibos/${reciboId}/impresion`,
    );
    return response.data;
  },

  ejecutarPreLiquidacion: async (
    periodoId: number,
  ): Promise<ResultadoPreLiquidacion> => {
    const response = await httpClient.post<ResultadoPreLiquidacion>(
      `${BASE_URL}/periodos-liquidacion/${periodoId}/pre-liquidacion`,
    );
    return response.data;
  },

  completarPreLiquidacion: async (
    periodoId: number,
  ): Promise<ResultadoPreLiquidacion> => {
    const response = await httpClient.post<ResultadoPreLiquidacion>(
      `${BASE_URL}/periodos-liquidacion/${periodoId}/pre-liquidacion/completar`,
    );
    return response.data;
  },
};
