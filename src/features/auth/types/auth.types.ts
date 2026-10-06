export type RolNombre = "ROLE_ADMIN" | "ROLE_RRHH" | "ROLE_OPERARIO";

export const rolLabels: Record<RolNombre, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_RRHH: "Recursos Humanos",
  ROLE_OPERARIO: "Operario",
};

export interface CurrentUser {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolNombre;
  empleadoId?: number;
  idEmpleado?: number;
  legajoId?: number;
}

export interface AuthResponse {
  email: string;
  message: string;
  jwt: string;
  refreshToken?: null;
  status: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}
export interface GoogleLoginRequest {
  idToken: string;
}
export interface ForgotPasswordRequest {
  email: string;
}
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
export type SessionStatus = "checking" | "authenticated" | "anonymous";
