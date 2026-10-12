import axios from "axios";
import { httpClient } from "@/shared/lib/http/httpClient";
import type {
  FormatoExportacion,
  ReporteFiltros,
  ReporteResponseDto,
  TipoReporte,
  TipoReporteResponseDto,
} from "../types/reporte.types";

const BASE_URL = "/api/reportes";

function toParams(filtros: ReporteFiltros): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      params[clave] = valor;
    }
  }
  return params;
}

function nombreArchivo(contentDisposition: string | undefined, porDefecto: string): string {
  const coincidencia = contentDisposition?.match(/filename="?([^";]+)"?/i);
  return coincidencia?.[1] ?? porDefecto;
}

/**
 * Catálogo de reportes disponibles con sus filtros y formatos de exportación.
 * GET /api/reportes
 */
export const obtenerTiposReporte = async (): Promise<TipoReporteResponseDto[]> => {
  const { data } = await httpClient.get<TipoReporteResponseDto[]>(BASE_URL);
  return data;
};

/**
 * Genera un reporte para mostrar en pantalla.
 * GET /api/reportes/{tipo}
 */
export const generarReporte = async (
  tipo: TipoReporte,
  filtros: ReporteFiltros,
): Promise<ReporteResponseDto> => {
  const { data } = await httpClient.get<ReporteResponseDto>(`${BASE_URL}/${tipo}`, {
    params: toParams(filtros),
  });
  return data;
};

/**
 * Descarga el reporte en el formato indicado.
 * GET /api/reportes/{tipo}/exportar?formato=PDF|EXCEL
 */
export const exportarReporte = async (
  tipo: TipoReporte,
  filtros: ReporteFiltros,
  formato: FormatoExportacion,
): Promise<void> => {
  try {
    const response = await httpClient.get<Blob>(`${BASE_URL}/${tipo}/exportar`, {
      params: { ...toParams(filtros), formato },
      responseType: "blob",
    });
    const extension = formato === "PDF" ? "pdf" : "xlsx";
    const nombre = nombreArchivo(
      response.headers["content-disposition"] as string | undefined,
      `${tipo.toLowerCase()}.${extension}`,
    );
    const url = URL.createObjectURL(response.data);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    // Con responseType "blob" el error JSON del backend también llega como Blob:
    // se convierte para que normalizeApiError pueda leer el mensaje.
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        // Cuerpo no JSON: se deja como está.
      }
    }
    throw error;
  }
};
