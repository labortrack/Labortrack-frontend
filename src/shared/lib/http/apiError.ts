import axios from "axios";

export interface ApiErrorPayload {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  details?: string;
}

export interface NormalizedApiError {
  status?: number;
  message: string;
  isNetworkError: boolean;
}

export function normalizeApiError(
  error: unknown,
  fallback = "Ocurrió un error inesperado.",
): NormalizedApiError {
  if (!axios.isAxiosError<ApiErrorPayload | string>(error)) {
    return {
      message: error instanceof Error ? error.message : fallback,
      isNetworkError: false,
    };
  }

  if (!error.response) {
    return {
      message:
        "No se pudo conectar con el servidor. Verificá tu conexión e intentá nuevamente.",
      isNetworkError: true,
    };
  }

  const payload = error.response.data;
  const message = typeof payload === "string" ? payload : payload?.message;
  return {
    status: error.response.status,
    message: message || fallback,
    isNetworkError: false,
  };
}
