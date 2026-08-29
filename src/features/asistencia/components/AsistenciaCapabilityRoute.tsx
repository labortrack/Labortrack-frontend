import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "@/shared/components";
import { useCapacidadesAsistencia } from "../hooks/useAsistencias";
import type { CapacidadesAsistenciaResponseDto } from "../types/asistencia.types";

interface AsistenciaCapabilityRouteProps {
  capacidad: keyof CapacidadesAsistenciaResponseDto;
  children: ReactNode;
}

export function AsistenciaCapabilityRoute({
  capacidad,
  children,
}: AsistenciaCapabilityRouteProps) {
  const { data: capacidades, isPending, isError } =
    useCapacidadesAsistencia();

  if (isPending) {
    return <LoadingState label="Comprobando acceso a asistencias..." />;
  }

  if (isError || !capacidades?.[capacidad]) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
