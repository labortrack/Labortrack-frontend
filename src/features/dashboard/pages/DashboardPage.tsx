import { useSearchParams } from "react-router-dom";
import { Card } from "@/shared/ui";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { fechaLocalActual } from "@/shared/utils/fechaLocal";
import { useDashboardResumen } from "../hooks/useDashboard";
import { DashboardOrganizacional } from "../components/DashboardOrganizacional";
import { DashboardLiderCuadrilla } from "../components/DashboardLiderCuadrilla";
import { DashboardPersonal } from "../components/DashboardPersonal";
import { LecturaRecibosSection } from "../components/LecturaRecibosSection";
import { useSessionStore } from "@/features/auth/store/sessionStore";

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

/** Solo fechas pasadas válidas; hoy o una fecha inválida equivalen a no filtrar. */
function leerFecha(valor: string | null, hoy: string): string | undefined {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor))) {
    return undefined;
  }
  return valor < hoy ? valor : undefined;
}

export default function DashboardPage() {
  // Los filtros viven en la URL: sobreviven a recargas y se pueden compartir.
  const [searchParams, setSearchParams] = useSearchParams();
  const hoy = fechaLocalActual();
  const obraId = leerObraId(searchParams.get("obraId"));
  const fecha = leerFecha(searchParams.get("fecha"), hoy);

  // El contador no tiene alcance operativo: el backend le niega el resumen y solo
  // le habilita el indicador de lectura de recibos.
  const esContador = useSessionStore((state) => state.user?.rol) === "ROLE_CONTADOR";
  const resumenQuery = useDashboardResumen(!esContador, obraId, fecha);

  const cambiarFiltro = (clave: "obraId" | "fecha", valor: string | undefined) => {
    setSearchParams(
      (actual) => {
        const siguiente = new URLSearchParams(actual);
        if (valor) siguiente.set(clave, valor);
        else siguiente.delete(clave);
        return siguiente;
      },
      { replace: true }
    );
  };

  if (esContador) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Indicadores de la liquidación de sueldos."
        />
        <LecturaRecibosSection />
      </div>
    );
  }


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
          onObraChange={(id) => cambiarFiltro("obraId", id ? String(id) : undefined)}
          fecha={fecha}
          onFechaChange={(nueva) => cambiarFiltro("fecha", nueva && nueva < hoy ? nueva : undefined)}
          actualizando={resumenQuery.isPlaceholderData}
        />
      )}
    </div>
  );
}
