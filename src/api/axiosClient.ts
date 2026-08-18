import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let memoryAccessToken: string | null = null;

export const setAccessTokenInMemory = (token: string | null): void => {
  memoryAccessToken = token;
};

export const getAccessTokenInMemory = (): string | null => {
  return memoryAccessToken;
};

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// 1. Interceptor de Solicitud (Adjunta el JWT en memoria)
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (memoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// 2. Interceptor de Respuesta (Manejo de Refresh Token automático)
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Lista de rutas donde un 401 NO debe disparar el refresh token
    const isAuthRoute =
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/google") ||
      originalRequest?.url?.includes("/api/auth/refresh") ||
      originalRequest?.url?.includes("/api/auth/forgot-password") ||
      originalRequest?.url?.includes("/api/auth/reset-password");

    // Si da 401 en una petición protegida normal (no de auth) y no fue reintentada
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
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

        // Reintenta la petición original con el nuevo token
        return axiosClient(originalRequest);
      } catch (refreshError) {
        setAccessTokenInMemory(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
