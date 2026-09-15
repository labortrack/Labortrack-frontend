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
  MisSolicitudesAusenciaPage,
  MiSolicitudAusenciaDetailPage,
  SolicitudesAusenciaPage,
  SolicitudAusenciaAdministrativaDetailPage,
  DashboardPage,
  ForgotPasswordPage,
  LoginPage,
  ResetPasswordPage,
  UsuariosPage,
  ObrasPage,
  ConfiguracionObrasPage,
  ObraDetailPage,
  ObraQrDisplayPage,
  CuadrillasPage,
  LegajosPage,
  EstructuraLaboralPage,
  MisDatosPage,
  MisAsistenciasPage,
  MiAsistenciaDetailPage,
  AsistenciaQrPage,
  AsistenciasPage,
  AsistenciaDetailPage,
  DocumentacionPage,
  AsistenteVirtualPage,
  MiEmpresaPage,
  RecibosPage,
  TiposSolicitudAusenciaPage,
  TipoSolicitudAusenciaDetailPage,
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
                  { path: "/mis-ausencias", element: <RoleRoute allowed={["ROLE_OPERARIO"]}>{suspense(<MisSolicitudesAusenciaPage />)}</RoleRoute> },
                  { path: "/mis-ausencias/:solicitudId", element: <RoleRoute allowed={["ROLE_OPERARIO"]}>{suspense(<MiSolicitudAusenciaDetailPage />)}</RoleRoute> },
                  { path: "/ausencias/solicitudes", element: <RoleRoute allowed={["ROLE_RRHH"]}>{suspense(<SolicitudesAusenciaPage />)}</RoleRoute> },
                  { path: "/ausencias/solicitudes/:solicitudId", element: <RoleRoute allowed={["ROLE_RRHH"]}>{suspense(<SolicitudAusenciaAdministrativaDetailPage />)}</RoleRoute> },
                  { path: "/mis-datos", element: suspense(<MisDatosPage />) },
                  {
                    path: "/ausencias/tipos-solicitud",
                    element: (
                      <RoleRoute allowed={["ROLE_RRHH"]}>
                        {suspense(<TiposSolicitudAusenciaPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/ausencias/tipos-solicitud/:tipoId",
                    element: (
                      <RoleRoute allowed={["ROLE_RRHH"]}>
                        {suspense(<TipoSolicitudAusenciaDetailPage />)}
                      </RoleRoute>
                    ),
                  },
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
                    path: "/estructura-laboral",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH"]}>
                        {suspense(<EstructuraLaboralPage />)}
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
                    path: "/documentacion",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH", "ROLE_OPERARIO"]}>
                        {suspense(<DocumentacionPage />)}
                      </RoleRoute>
                    ),
                  },
                  {
                    path: "/asistente-virtual",
                    element: (
                      <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH", "ROLE_OPERARIO"]}>
                        {suspense(<AsistenteVirtualPage />)}
                      </RoleRoute>
                    ),
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
              {
                path: "/obras/:id/qr",
                element: (
                  <RoleRoute allowed={["ROLE_ADMIN"]}>
                    {suspense(<ObraQrDisplayPage />)}
                  </RoleRoute>
                ),
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

