import { Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layouts/AppLayout";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { ErrorPage } from "./ErrorPage";
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from "./guards";
import { AsistenciaCapabilityRoute } from "@/features/asistencia/components/AsistenciaCapabilityRoute";
import { EmpresaInicializacionGate } from "@/features/empresa/components/EmpresaInicializacionGate";
import { LoadingState } from "@/shared/components";
import {
  DashboardPage,
  ForgotPasswordPage,
  LoginPage,
  ResetPasswordPage,
  UsuariosPage,
  ObrasPage,
  ConfiguracionObrasPage,
  ObraDetailPage,
  CuadrillasPage,
  LegajosPage,
  MisDatosPage,
  MisAsistenciasPage,
  MiAsistenciaDetailPage,
  AsistenciaQrPage,
  AsistenciasPage,
  AsistenciaDetailPage,
  MiEmpresaPage,
  RecibosPage,
} from "./lazyPages";

const suspense = (element: ReactNode) => (
  <Suspense fallback={<LoadingState />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: "/login", element: suspense(<LoginPage />) },
              {
                path: "/forgot-password",
                element: suspense(<ForgotPasswordPage />),
              },
              {
                path: "/reset-password",
                element: suspense(<ResetPasswordPage />),
              },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <EmpresaInicializacionGate />,
            children: [
              {
                element: <AppLayout />,
                children: [
                  { path: "/dashboard", element: suspense(<DashboardPage />) },
                  { path: "/mis-datos", element: suspense(<MisDatosPage />) },
                  {
                    path: "/usuarios",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH"]}>
                        {suspense(<UsuariosPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/obras",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH"]}>
                        {suspense(<ObrasPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/legajos",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH"]}>
                        {suspense(<LegajosPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/obras/:id",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH"]}>
                        {suspense(<ObraDetailPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/obras/:obraId/cuadrillas",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH"]}>
                        {suspense(<CuadrillasPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/obras/configuracion",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH"]}>
                        {suspense(<ConfiguracionObrasPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/configuracion-obras",
                    element: <Navigate to="/obras/configuracion" replace />,
                  },
                  {
                    path: "/mi-empresa",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN"]}>
                        {suspense(<MiEmpresaPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/recibos",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN"]}>
                        {suspense(<RecibosPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/mis-asistencias",
                    element: (
                      <AsistenciaCapabilityRoute capacidad="misAsistencias">
                        {suspense(<MisAsistenciasPage />)}
                      </AsistenciaCapabilityRoute>
                    ),
                  },
                  {
                    path: "/mis-asistencias/:asistenciaId",
                    element: (
                      <AsistenciaCapabilityRoute capacidad="misAsistencias">
                        {suspense(<MiAsistenciaDetailPage />)}
                      </AsistenciaCapabilityRoute>
                    ),
                  },
                  {
                    path: "/asistencias/qr",
                    element: (
                      <AsistenciaCapabilityRoute capacidad="misAsistencias">
                        {suspense(<AsistenciaQrPage />)}
                      </AsistenciaCapabilityRoute>
                    ),
                  },
                  {
                    path: "/asistencias",
                    element: (
                      <AsistenciaCapabilityRoute capacidad="parteDiario">
                        {suspense(<AsistenciasPage />)}
                      </AsistenciaCapabilityRoute>
                    ),
                  },
                  {
                    path: "/asistencias/:asistenciaId",
                    element: (
                      <AsistenciaCapabilityRoute capacidad="parteDiario">
                        {suspense(<AsistenciaDetailPage />)}
                      </AsistenciaCapabilityRoute>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);

