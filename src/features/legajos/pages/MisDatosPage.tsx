import { useState } from "react";
import { useHistorialEstados, useMiLegajo } from "../hooks/useLegajos";
import { EmpleadoDetail360 } from "../components/EmpleadoDetail360";
import { EmpleadoForm } from "../components/EmpleadoForm";
import {
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/shared/components";

export default function MisDatosPage() {
  const [isEditing, setIsEditing] = useState(false);

  const { data: legajo, isLoading, isError } = useMiLegajo();
  const { data: historialEstadosData } = useHistorialEstados(legajo?.id);

  if (isLoading) {
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

  if (isError || !legajo) {
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

  if (isEditing) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Modificar Mis Datos"
          description="Actualizá tu domicilio, teléfono o contactos de emergencia."
        />
        <EmpleadoForm
          empleadoId={legajo.id}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ficha 360° · ${legajo.apellido}, ${legajo.nombre}`}
        description={`CUIL ${legajo.cuil} — DNI ${legajo.dni}`}
      />
      <EmpleadoDetail360
        legajo={legajo}
        historialEstados={historialEstadosData || []}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
}

