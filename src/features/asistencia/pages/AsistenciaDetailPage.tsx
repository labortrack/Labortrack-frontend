import { Navigate, useParams } from "react-router-dom";
import { PageHeader } from "@/shared/components";

export default function AsistenciaDetailPage() {
  const { asistenciaId } = useParams();
  const id = Number(asistenciaId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/asistencias" replace />;
  }

  return (
    <PageHeader
      title="Detalle de asistencia"
      description="Consultá el registro y las acciones disponibles para esta asistencia."
    />
  );
}
