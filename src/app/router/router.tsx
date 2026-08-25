import { Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layouts/AppLayout";
import { AuthLayout } from "@/app/layouts/AuthLayout";
import { ErrorPage } from "./ErrorPage";
import { ProtectedRoute, PublicOnlyRoute, RoleRoute } from "./guards";
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
            element: <AppLayout />,
            children: [
              { path: "/dashboard", element: suspense(<DashboardPage />) },
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
                path: "/obras/:id",
                element: (
                  <RoleRoute allowed={["ROLE_ADMIN", "ROLE_RRHH"]}>
                    {suspense(<ObraDetailPage />)}
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
            ],
          },
        ],
      },
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
