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
export const CuadrillasPage = lazy(
  () => import("@/features/cuadrilla/pages/CuadrillasPage"),
);
export const LegajosPage = lazy(
  () => import("@/features/legajos/pages/LegajosPage"),
);
export const MisDatosPage = lazy(
  () => import("@/features/legajos/pages/MisDatosPage"),
);

export const MisAsistenciasPage = lazy(
  () => import("@/features/asistencia/pages/MisAsistenciasPage"),
);
export const MiAsistenciaDetailPage = lazy(
  () => import("@/features/asistencia/pages/MiAsistenciaDetailPage"),
);
export const AsistenciaQrPage = lazy(
  () => import("@/features/asistencia/pages/AsistenciaQrPage"),
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
export const MiEmpresaPage = lazy(
  () => import("@/features/empresa/pages/MiEmpresaPage"),
);
export const RecibosPage = lazy(
  () => import("@/features/recibos/pages/RecibosPage"),
);

