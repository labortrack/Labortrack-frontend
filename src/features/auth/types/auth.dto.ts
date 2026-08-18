// Requests
export interface AuthLoginRequestDto {
  email: string;
  password: string;
}

export interface GoogleLoginRequestDto {
  idToken: string;
}

export interface RefreshTokenRequestDto {
  refreshToken?: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

// Responses
export interface AuthLoginResponseDto {
  email: string;
  message: string;
  jwt: string;
  refreshToken?: string | null;
  status: boolean;
}
