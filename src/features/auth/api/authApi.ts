import { axiosClient } from "@/api/axiosClient";
import type {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  GoogleLoginRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
} from "../types/auth.dto";

export const authApi = {
  login: async (
    credentials: AuthLoginRequestDto,
  ): Promise<AuthLoginResponseDto> => {
    const { data } = await axiosClient.post<AuthLoginResponseDto>(
      "/api/auth/login",
      credentials,
    );
    return data;
  },

  loginWithGoogle: async (
    payload: GoogleLoginRequestDto,
  ): Promise<AuthLoginResponseDto> => {
    const { data } = await axiosClient.post<AuthLoginResponseDto>(
      "/api/auth/google",
      payload,
    );
    return data;
  },

  refresh: async (): Promise<AuthLoginResponseDto> => {
    const { data } =
      await axiosClient.post<AuthLoginResponseDto>("/api/auth/refresh");
    return data;
  },

  logout: async (): Promise<string> => {
    const { data } = await axiosClient.post<string>("/api/auth/logout");
    return data;
  },

  forgotPassword: async (
    payload: ForgotPasswordRequestDto,
  ): Promise<string> => {
    const { data } = await axiosClient.post<string>(
      "/api/auth/forgot-password",
      payload,
    );
    return data;
  },

  resetPassword: async (payload: ResetPasswordRequestDto): Promise<string> => {
    const { data } = await axiosClient.post<string>(
      "/api/auth/reset-password",
      payload,
    );
    return data;
  },
};
