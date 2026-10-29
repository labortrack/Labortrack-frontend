import { useSearchParams } from "react-router-dom";
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

function leerObraId(valor: string | null): number | undefined {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

export default function DashboardPage() {
  // El filtro de obra vive en la URL: sobrevive a recargas y se puede compartir.
  const [searchParams, setSearchParams] = useSearchParams();
  const obraId = leerObraId(searchParams.get("obraId"));
  const resumenQuery = useDashboardResumen(true, obraId);

  const cambiarObra = (nuevaObraId: number | undefined) => {
    setSearchParams(
      (actual) => {
        const siguiente = new URLSearchParams(actual);
        if (nuevaObraId) siguiente.set("obraId", String(nuevaObraId));
        else siguiente.delete("obraId");
        return siguiente;
      },
      { replace: true }
    );
  };

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
        <DashboardOrganizacional
          data={resumenQuery.data.organizacional!}
          obraId={obraId}
          onObraChange={cambiarObra}
          actualizando={resumenQuery.isPlaceholderData}
        />
      )}
    </div>
  );
}
