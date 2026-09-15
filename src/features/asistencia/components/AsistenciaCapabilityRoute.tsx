import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingState } from "@/shared/components";
import { useCapacidadesAsistencia } from "../hooks/useAsistencias";

interface AsistenciaCapabilityRouteProps {
  capacidad: "misAsistencias" | "parteDiario";
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

  const tieneCapacidad =
    capacidad === "misAsistencias"
      ? capacidades?.puedeConsultarMisAsistencias
      : capacidades?.parteDiario?.puedeConsultar;

  if (isError || !tieneCapacidad) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
