import { Navigate, useParams } from "react-router-dom";
import { PageHeader } from "@/shared/components";

export default function MiAsistenciaDetailPage() {
  const { asistenciaId } = useParams();
  const id = Number(asistenciaId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/mis-asistencias" replace />;
  }

  return (
    <PageHeader
      title="Detalle de asistencia"
      description="Consultá la información completa de tu asistencia."
    />
  );
}
