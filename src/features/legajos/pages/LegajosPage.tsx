import { useState } from "react";
import type { EmpleadoFilterParams } from "../types/legajo.types";
import {
  useHistorialEstados,
  useLegajoDetail,
  useLegajosList,
} from "../hooks/useLegajos";
import { EmpleadoFilters } from "../components/EmpleadoFilters";
import { EmpleadoTable } from "../components/EmpleadoTable";
import { EmpleadoDetail360 } from "../components/EmpleadoDetail360";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";

const DEFAULT_FILTERS: EmpleadoFilterParams = {
  buscar: "",
  categoria: "",
  estado: "",
};

export default function LegajosPage() {
  const [filters, setFilters] = useState<EmpleadoFilterParams>(DEFAULT_FILTERS);
  const [page, setPage] = useState<number>(0);
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState<number | null>(
    null,
  );

  const {
    data: pageData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLegajosList(filters, page, 10);

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useLegajoDetail(selectedEmpleadoId);

  const { data: historialEstadosData } = useHistorialEstados(
    selectedEmpleadoId,
  );

  const handleApplyFilters = (newFilters: EmpleadoFilterParams) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  };

  const handleSelectEmpleado = (id: number) => {
    setSelectedEmpleadoId(id);
  };

  const handleBackToList = () => {
    setSelectedEmpleadoId(null);
  };

  // Si estamos en la Vista 360° (Detalle)
  if (selectedEmpleadoId !== null) {
    if (isDetailLoading) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Gestión de Legajos Digitales"
            description="Cargando ficha 360° del empleado..."
          />
          <LoadingState label="Cargando perfil 360°..." />
        </div>
      );
    }

    if (isDetailError || !detailData) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Gestión de Legajos Digitales"
            description="Error al consultar perfil del empleado"
          />
          <ErrorState
            message={
              detailError?.message ||
              "No fue posible cargar el detalle del legajo seleccionado."
            }
            onRetry={refetchDetail}
          />
          <div className="flex justify-center">
            <button
              onClick={handleBackToList}
              className="text-sm text-primary underline"
            >
              Volver al listado de empleados
            </button>
          </div>
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
          onBack={handleBackToList}
        />
      </div>
    );
  }

  // Vista principal: Grilla de Búsqueda
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Legajos Digitales"
        description="Consulta de legajos, situación contractual y localización operativa de trabajadores."
      />

      <EmpleadoFilters
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        isPending={isFetching}
      />

      {isError ? (
        <ErrorState
          message={
            error?.message ||
            "Ocurrió un error al cargar la lista de empleados. Por favor, reintente."
          }
          onRetry={refetch}
        />
      ) : isLoading ? (
        <LoadingState label="Cargando empleados..." />
      ) : (
        <EmpleadoTable
          data={pageData?.content || []}
          totalElements={pageData?.totalElements || 0}
          totalPages={pageData?.totalPages || 1}
          page={page}
          onPageChange={(newPage) => setPage(newPage)}
          onSelectEmpleado={handleSelectEmpleado}
          isLoading={isFetching}
        />
      )}
    </div>
  );
}
