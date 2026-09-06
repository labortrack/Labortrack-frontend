import { lazy } from "react";

export const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
export const ForgotPasswordPage = lazy(
  () => import("@/features/auth/pages/ForgotPasswordPage"),
);
export const ResetPasswordPage = lazy(
  () => import("@/features/auth/pages/ResetPasswordPage"),
);
export const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
export const UsuariosPage = lazy(
  () => import("@/features/usuarios/pages/UsuariosPage"),
);
export const ObrasPage = lazy(
  () => import("@/features/obra/pages/ObrasPage"),
);
export const ConfiguracionObrasPage = lazy(
  () => import("@/features/obra/estado/pages/ConfiguracionObrasPage"),
);
export const ObraDetailPage = lazy(
  () => import("@/features/obra/pages/ObraDetailPage"),
);
export const MisAsistenciasPage = lazy(
  () => import("@/features/asistencia/pages/MisAsistenciasPage"),
);
export const MiAsistenciaDetailPage = lazy(
  () => import("@/features/asistencia/pages/MiAsistenciaDetailPage"),
);
export const AsistenciasPage = lazy(
  () => import("@/features/asistencia/pages/AsistenciasPage"),
);
export const AsistenciaDetailPage = lazy(
  () => import("@/features/asistencia/pages/AsistenciaDetailPage"),
);
export const DocumentacionPage = lazy(
  () => import("@/features/documentacion/pages/DocumentacionPage"),
);
