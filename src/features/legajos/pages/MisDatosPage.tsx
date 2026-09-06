import { useState } from "react";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useHistorialEstados, useLegajoDetail } from "../hooks/useLegajos";
import { EmpleadoDetail360 } from "../components/EmpleadoDetail360";
import { EmpleadoForm } from "../components/EmpleadoForm";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/shared/components";

export default function MisDatosPage() {
  const user = useSessionStore((state) => state.user);
  const empleadoId = user?.empleadoId;

  const [isEditing, setIsEditing] = useState(false);

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useLegajoDetail(empleadoId);

  const { data: historialEstadosData } = useHistorialEstados(empleadoId);

  // Si el usuario no posee un legajo vinculado
  if (!empleadoId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ficha 360° · Mis Datos"
          description="Portal de autogestión para el trabajador."
        />
        <div className="rounded-card border border-border bg-card shadow-soft p-6">
          <EmptyState
            title="Tu usuario aún no tiene un legajo asociado"
            description="Comunicate con el área de Recursos Humanos para que asocien tu cuenta de acceso a tu legajo digital."
          />
        </div>
      </div>
    );
  }

  if (isDetailLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ficha 360° · Mis Datos"
          description="Cargando tu ficha personal..."
        />
        <LoadingState label="Cargando tus datos laborales y personales..." />
      </div>
    );
  }

  if (isDetailError || !detailData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ficha 360° · Mis Datos"
          description="Portal de autogestión para el trabajador."
        />
        <ErrorState
          message={
            detailError?.message ||
            "No fue posible cargar la información de tu legajo."
          }
          onRetry={refetchDetail}
        />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Modificar Mis Datos"
          description="Actualizá tu domicilio, teléfono o contactos de emergencia."
        />
        <EmpleadoForm
          empleadoId={empleadoId}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ficha 360° · ${detailData.apellido}, ${detailData.nombre}`}
        description={`CUIL ${detailData.cuil} — DNI ${detailData.dni}`}
      />
      <EmpleadoDetail360
        legajo={detailData}
        historialEstados={historialEstadosData || []}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}
