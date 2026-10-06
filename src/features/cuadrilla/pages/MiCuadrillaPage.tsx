import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { useDashboardResumen } from "@/features/dashboard/hooks/useDashboard";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useCuadrilla } from "../hooks/useCuadrillas";
import { useMiCuadrillaNavegacionStore } from "../store/miCuadrillaNavegacionStore";
import { CuadrillaDetailView } from "../components/CuadrillaDetailView";

export default function MiCuadrillaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const usuarioId = useSessionStore((state) => state.user!.idUsuario);
  const busquedaGuardada = useMiCuadrillaNavegacionStore(
    (state) => state.busquedaPorUsuario[String(usuarioId)] ?? "",
  );
  const guardarBusqueda = useMiCuadrillaNavegacionStore(
    (state) => state.guardarBusqueda,
  );
  const busquedaActual = searchParams.toString();
  const dashboardQuery = useDashboardResumen();
  const cuadrillas = useMemo(
    () => dashboardQuery.data?.cuadrilla?.misCuadrillas ?? [],
    [dashboardQuery.data],
  );
  const selectedParam = Number(searchParams.get("cuadrilla"));
  const effectiveSelectedId =
    cuadrillas.find((item) => item.cuadrillaId === selectedParam)?.cuadrillaId ??
    cuadrillas[0]?.cuadrillaId ??
    null;
  const cuadrillaQuery = useCuadrilla(effectiveSelectedId);

  useEffect(() => {
    if (!busquedaActual && busquedaGuardada) {
      setSearchParams(new URLSearchParams(busquedaGuardada), { replace: true });
      return;
    }

    if (busquedaActual && busquedaActual !== busquedaGuardada) {
      guardarBusqueda(usuarioId, busquedaActual);
    }
  }, [
    busquedaActual,
    busquedaGuardada,
    guardarBusqueda,
    setSearchParams,
    usuarioId,
  ]);

  if (dashboardQuery.isPending) {
    return <Card><LoadingState label="Cargando tu cuadrilla..." /></Card>;
  }
  if (dashboardQuery.isError) {
    return <Card><ErrorState message="No se pudo determinar la cuadrilla que liderás." onRetry={() => void dashboardQuery.refetch()} /></Card>;
  }
  if (dashboardQuery.data?.tipoAlcance !== "CUADRILLA" || cuadrillas.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No tenés una cuadrilla a cargo"
          description="Esta opción está disponible cuando tenés una asignación vigente como Líder de cuadrilla."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi cuadrilla"
        description="Consultá la nómina, los planes de trabajo y sus jornadas sin salir de tu espacio de Líder."
        actions={
          cuadrillas.length > 1 ? (
            <Select
              value={String(effectiveSelectedId)}
              onValueChange={(value) =>
                setSearchParams((current) => {
                  const next = new URLSearchParams(current);
                  next.set("cuadrilla", value);
                  if (!next.has("seccion")) next.set("seccion", "nomina");
                  return next;
                })
              }
            >
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cuadrillas.map((item) => <SelectItem key={item.cuadrillaId} value={String(item.cuadrillaId)}>{item.nombreCuadrilla}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : undefined
        }
      />

      {cuadrillaQuery.isPending ? (
        <Card><LoadingState label="Cargando información de la cuadrilla..." /></Card>
      ) : cuadrillaQuery.isError || !cuadrillaQuery.data ? (
        <Card><ErrorState message="No se pudo cargar la información de tu cuadrilla." onRetry={() => void cuadrillaQuery.refetch()} /></Card>
      ) : (
        <CuadrillaDetailView cuadrilla={cuadrillaQuery.data} readOnly />
      )}
    </div>
  );
}
