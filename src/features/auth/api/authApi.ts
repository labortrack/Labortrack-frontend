import { httpClient } from "@/shared/lib/http/httpClient";
import type { AuthResponse, CurrentUser, ForgotPasswordRequest, GoogleLoginRequest, LoginRequest, ResetPasswordRequest } from "../types/auth.types";

export const authApi = {
  login: async (payload: LoginRequest) => (await httpClient.post<AuthResponse>("/api/auth/login", payload)).data,
  loginWithGoogle: async (payload: GoogleLoginRequest) => (await httpClient.post<AuthResponse>("/api/auth/google", payload)).data,
  me: async () => (await httpClient.get<CurrentUser>("/api/auth/me")).data,
  logout: async () => (await httpClient.post<string>("/api/auth/logout")).data,
  forgotPassword: async (payload: ForgotPasswordRequest) => (await httpClient.post<string>("/api/auth/forgot-password", payload)).data,
  resetPassword: async (payload: ResetPasswordRequest) => (await httpClient.post<string>("/api/auth/reset-password", payload)).data,
};
