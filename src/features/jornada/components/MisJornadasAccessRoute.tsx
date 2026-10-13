import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useObras } from "@/features/obra/hooks/useObras";
import { ErrorState, LoadingState } from "@/shared/components";
import { Card } from "@/shared/ui";

export function MisJornadasAccessRoute({ children }: { children: ReactNode }) {
  const esOperario = useSessionStore((state) => state.user?.rol === "ROLE_OPERARIO");
  const obrasQuery = useObras(undefined, esOperario);

  if (!esOperario) return <Navigate to="/dashboard" replace />;
  if (obrasQuery.isPending) return <Card><LoadingState label="Verificando acceso a Mis jornadas…" /></Card>;
  if (obrasQuery.isError) {
    return <Card><ErrorState message="No pudimos verificar tu acceso a Mis jornadas." onRetry={() => void obrasQuery.refetch()} /></Card>;
  }
  if (obrasQuery.data.length > 0) return <Navigate to="/dashboard" replace />;

  return children;
}
