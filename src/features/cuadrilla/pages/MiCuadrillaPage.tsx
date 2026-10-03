import { useMemo, useState } from "react";
import { HardHat } from "lucide-react";
import { Card, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { useDashboardResumen } from "@/features/dashboard/hooks/useDashboard";
import { useCuadrilla, useOperariosCuadrilla } from "../hooks/useCuadrillas";
import { CuadrillaWorkspace } from "../components/CuadrillaWorkspace";

export default function MiCuadrillaPage() {
  const dashboardQuery = useDashboardResumen();
  const cuadrillas = useMemo(
    () => dashboardQuery.data?.cuadrilla?.misCuadrillas ?? [],
    [dashboardQuery.data],
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const effectiveSelectedId = selectedId ?? cuadrillas[0]?.cuadrillaId ?? null;
  const cuadrillaQuery = useCuadrilla(effectiveSelectedId);
  const operariosQuery = useOperariosCuadrilla(effectiveSelectedId);

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
            <Select value={String(effectiveSelectedId)} onValueChange={(value) => setSelectedId(Number(value))}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cuadrillas.map((item) => <SelectItem key={item.cuadrillaId} value={String(item.cuadrillaId)}>{item.nombreCuadrilla}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : undefined
        }
      />

      <Card className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><HardHat className="size-5" /></div>
        <div>
          <p className="font-bold">{cuadrillas.find((item) => item.cuadrillaId === effectiveSelectedId)?.nombreCuadrilla}</p>
          <p className="text-sm text-foreground-muted">{cuadrillas.find((item) => item.cuadrillaId === effectiveSelectedId)?.nombreObra}</p>
        </div>
      </Card>

      {cuadrillaQuery.isPending ? (
        <Card><LoadingState label="Cargando información de la cuadrilla..." /></Card>
      ) : cuadrillaQuery.isError || !cuadrillaQuery.data ? (
        <Card><ErrorState message="No se pudo cargar la información de tu cuadrilla." onRetry={() => void cuadrillaQuery.refetch()} /></Card>
      ) : (
        <CuadrillaWorkspace
          key={cuadrillaQuery.data.id}
          cuadrilla={cuadrillaQuery.data}
          operarios={operariosQuery.data ?? []}
          isLoadingOperarios={operariosQuery.isPending}
          isErrorOperarios={operariosQuery.isError}
          onRetryOperarios={() => void operariosQuery.refetch()}
          onAsignarOperario={() => undefined}
          onDesvincularOperario={() => undefined}
          readOnly
        />
      )}
    </div>
  );
}
