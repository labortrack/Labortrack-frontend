import { axiosClient } from "@/api/axiosClient";
import type {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  RefreshTokenRequestDto,
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

  logout: async (payload: RefreshTokenRequestDto): Promise<string> => {
    const { data } = await axiosClient.post<string>(
      "/api/auth/logout",
      payload,
    );
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
