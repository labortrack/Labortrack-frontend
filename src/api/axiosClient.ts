import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Toma http://localhost:8080 directamente del .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let memoryAccessToken: string | null = null;

export const setAccessTokenInMemory = (token: string | null): void => {
  memoryAccessToken = token;
};

export const getAccessTokenInMemory = (): string | null => {
  return memoryAccessToken;
};

export const axiosClient = axios.create({
  baseURL: API_BASE_URL, // Sin /api hardcodeado
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 1. Interceptor de Solicitud
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (memoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// 2. Interceptor de Respuesta
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Detecta 401 y evita reintentar si el fallo viene del propio endpoint de refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Llama a la ruta exacta donde tengas tu refresh (ej: /api/auth/refresh o /auth/refresh)
        const { data } = await axios.post<{ jwt: string }>(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = data.jwt;
        setAccessTokenInMemory(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axiosClient(originalRequest);
      } catch (refreshError) {
        setAccessTokenInMemory(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
