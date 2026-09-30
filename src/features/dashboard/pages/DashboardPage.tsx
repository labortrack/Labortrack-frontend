import { Card } from "@/shared/ui";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useDashboardResumen } from "../hooks/useDashboard";
import { DashboardOrganizacional } from "../components/DashboardOrganizacional";
import { DashboardLiderCuadrilla } from "../components/DashboardLiderCuadrilla";
import { DashboardPersonal } from "../components/DashboardPersonal";

const DESCRIPCION_POR_ALCANCE: Record<string, string> = {
  GLOBAL: "Indicadores clave del sistema.",
  OBRA: "Indicadores de las obras donde sos capataz.",
  CUADRILLA: "Indicadores de las cuadrillas que lideras.",
  PERSONAL: "Tu resumen personal.",
};

export default function DashboardPage() {
  const resumenQuery = useDashboardResumen();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          resumenQuery.data
            ? DESCRIPCION_POR_ALCANCE[resumenQuery.data.tipoAlcance]
            : "Indicadores clave del sistema, según tu alcance operativo."
        }
      />

      {resumenQuery.isPending ? (
        <Card className="p-8">
          <LoadingState label="Cargando indicadores..." />
        </Card>
      ) : resumenQuery.isError ? (
        <Card className="p-6">
          <ErrorState
            message={
              normalizeApiError(
                resumenQuery.error,
                "No se pudieron cargar los indicadores del dashboard."
              ).message
            }
            onRetry={() => void resumenQuery.refetch()}
          />
        </Card>
      ) : resumenQuery.data.tipoAlcance === "CUADRILLA" ? (
        <DashboardLiderCuadrilla data={resumenQuery.data.cuadrilla!} />
      ) : resumenQuery.data.tipoAlcance === "PERSONAL" ? (
        <DashboardPersonal data={resumenQuery.data.personal!} />
      ) : (
        <DashboardOrganizacional data={resumenQuery.data.organizacional!} />
      )}
    </div>
  );
}
