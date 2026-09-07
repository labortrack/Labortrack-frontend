import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import type { RolNombre } from "@/features/auth/types/auth.types";
import { Spinner } from "@/shared/ui";

function SessionLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-page text-sm text-foreground-muted">
      <Spinner className="size-8" />
      <span>Verificando sesión...</span>
    </div>
  );
}

export function PublicOnlyRoute() {
  const status = useSessionStore((state) => state.status);
  if (status === "checking") return <SessionLoading />;
  return status === "authenticated" ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Outlet />
  );
}

export function ProtectedRoute() {
  const status = useSessionStore((state) => state.status);
  const location = useLocation();
  if (status === "checking") return <SessionLoading />;
  return status === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{ from: `${location.pathname}${location.search}${location.hash}` }}
    />
  );
}

export function RoleRoute({
  allowed,
  children,
}: {
  allowed: RolNombre[];
  children: ReactNode;
}) {
  const user = useSessionStore((state) => state.user);
  return user && allowed.includes(user.rol) ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}
