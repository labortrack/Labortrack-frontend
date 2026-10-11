import { Card } from "@/shared/ui";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import type { EmpleadoResponseDto } from "@/features/legajos/types/legajo.types";
import { useHistorialEstados } from "@/features/legajos/hooks/useLegajos";
import { EmpleadoDetail360 } from "@/features/legajos/components/EmpleadoDetail360";
import { EmpleadoForm } from "@/features/legajos/components/EmpleadoForm";

interface MiLegajoTabProps {
  legajo?: EmpleadoResponseDto;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  isEditing: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export function MiLegajoTab({
  legajo,
  isLoading,
  isError,
  error,
  onRetry,
  isEditing,
  onStartEditing,
  onCancelEditing,
  onSaveSuccess,
  onDirtyChange,
}: MiLegajoTabProps) {
  const { data: historialEstadosData } = useHistorialEstados(legajo?.id);

  if (isLoading) {
    return (
      <Card>
        <LoadingState label="Cargando tus datos laborales y personales..." />
      </Card>
    );
  }

  if (isError && !legajo) {
    return (
      <Card className="p-6">
        <ErrorState
          message={
            normalizeApiError(
              error,
              "No se pudo cargar la información de tu legajo.",
            ).message
          }
          onRetry={onRetry}
        />
      </Card>
    );
  }

  if (!legajo) {
    return null;
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
          onSuccess={onSaveSuccess}
          onCancel={onCancelEditing}
          onDirtyChange={onDirtyChange}
        />
      </div>
    );
  }

  return (
    <EmpleadoDetail360
      legajo={legajo}
      historialEstados={historialEstadosData || []}
      onEdit={onStartEditing}
    />
  );
}
