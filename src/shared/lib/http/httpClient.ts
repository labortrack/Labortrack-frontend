import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/app/config/env";
import { notifyUnauthorized } from "./sessionEvents";
import { getAccessToken, setAccessToken } from "./tokenManager";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  jwt: string;
}

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
});

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<RefreshResponse>("/api/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.jwt);
        return data.jwt;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const refreshExcludedRoutes = [
  "/api/auth/login",
  "/api/auth/google",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;
    const excluded = refreshExcludedRoutes.some((route) =>
      request?.url?.includes(route),
    );

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      excluded
    ) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const token = await refreshAccessToken();
      request.headers.Authorization = `Bearer ${token}`;
      return httpClient(request);
    } catch (refreshError) {
      setAccessToken(null);
      notifyUnauthorized();
      return Promise.reject(refreshError);
    }
  },
);
