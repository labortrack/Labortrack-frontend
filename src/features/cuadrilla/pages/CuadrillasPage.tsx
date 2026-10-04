import { useState, useMemo } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Plus, HardHat } from "lucide-react";
import {
  BackLink,
  PageHeader,
  LoadingState,
  ErrorState,
  SearchInput,
} from "@/shared/components";
import { Button, Card } from "@/shared/ui";
import { useObra } from "@/features/obra/hooks/useObras";
import { useCuadrillasPorObra } from "../hooks/useCuadrillas";
import { CuadrillaMetrics } from "../components/CuadrillaMetrics";
import { CuadrillaCard } from "../components/CuadrillaCard";
import { CreateCuadrillaDialog } from "../components/dialogs/CreateCuadrillaDialog";
import { EditCuadrillaDialog } from "../components/dialogs/EditCuadrillaDialog";
import { BajaCuadrillaDialog } from "../components/dialogs/BajaCuadrillaDialog";
import { ReactivarCuadrillaDialog } from "../components/dialogs/ReactivarCuadrillaDialog";
import { AsignarLiderDialog } from "../components/dialogs/AsignarLiderDialog";
import type { CuadrillaResponseDto } from "../types/cuadrilla.types";

function matchesCuadrillaFilters(
  cuadrilla: CuadrillaResponseDto,
  searchTerm: string,
  statusFilter: string,
) {
  const term = searchTerm.toLowerCase().trim();
  const matchesSearch =
    !term ||
    cuadrilla.nombre.toLowerCase().includes(term) ||
    (cuadrilla.grupo?.tipoActividad &&
      cuadrilla.grupo.tipoActividad.toLowerCase().includes(term)) ||
    (cuadrilla.lider &&
      `${cuadrilla.lider.nombre} ${cuadrilla.lider.apellido}`
        .toLowerCase()
        .includes(term));
  const matchesStatus =
    statusFilter === "TODAS" || cuadrilla.estadoActual === statusFilter;

  return Boolean(matchesSearch && matchesStatus);
}

export default function CuadrillasPage() {
  const { obraId: paramObraId } = useParams<{ obraId: string }>();
  const obraId = Number(paramObraId);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Queries
  const obraQuery = useObra(obraId);
  const cuadrillasQuery = useCuadrillasPorObra(obraId);

  const obra = obraQuery.data;
  const cuadrillas = useMemo(
    () => cuadrillasQuery.data?.content ?? [],
    [cuadrillasQuery.data],
  );

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODAS");

  // Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [editCuadrilla, setEditCuadrilla] =
    useState<CuadrillaResponseDto | null>(null);
  const [bajaCuadrilla, setBajaCuadrilla] =
    useState<CuadrillaResponseDto | null>(null);
  const [reactivarCuadrilla, setReactivarCuadrilla] =
    useState<CuadrillaResponseDto | null>(null);
  const [liderCuadrilla, setLiderCuadrilla] =
    useState<CuadrillaResponseDto | null>(null);

  // Filtered cuadrillas list
  const filteredCuadrillas = useMemo(() => {
    return cuadrillas.filter((cuadrilla) =>
      matchesCuadrillaFilters(cuadrilla, searchTerm, statusFilter),
    );
  }, [cuadrillas, searchTerm, statusFilter]);

  // Compatibilidad con links viejos: ?cuadrilla=X&seccion=Y ahora es una ruta propia.
  const legacyCuadrillaId = Number(searchParams.get("cuadrilla"));
  if (Number.isInteger(legacyCuadrillaId) && legacyCuadrillaId > 0) {
    const legacyParams = new URLSearchParams(searchParams);
    legacyParams.delete("cuadrilla");
    const query = legacyParams.toString();
    return (
      <Navigate
        replace
        to={`/obras/${obraId}/cuadrillas/${legacyCuadrillaId}${query ? `?${query}` : ""}`}
      />
    );
  }

  if (obraQuery.isPending) {
    return (
      <div className="space-y-6">
        <BackLink to={`/obras/${obraId}`} />
        <Card className="p-12">
          <LoadingState label="Cargando información de la obra..." />
        </Card>
      </div>
    );
  }

  if (obraQuery.isError || !obra) {
    return (
      <div className="space-y-6">
        <BackLink to="/obras" />
        <Card className="p-8">
          <ErrorState
            message="No se pudo cargar la información de la obra solicitada."
            onRetry={() => void obraQuery.refetch()}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb / Header ───────────────────────────────── */}
      <div>
        <BackLink to={`/obras/${obraId}`} />

        <PageHeader
          title="Gestión de Cuadrillas"
          description={`Obra: ${obra.nombreObra} • Nomenclatura: ${obra.nomenclatura}`}
          actions={
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 shadow-xs"
            >
              <Plus className="size-4" />
              <span>Nueva Cuadrilla</span>
            </Button>
          }
        />
      </div>

      {/* ── Metrics Row ────────────────────────────────────────── */}
      <CuadrillaMetrics cuadrillas={cuadrillas} />

      {/* ── Main Section: Cuadrillas List & Filters ────────────── */}
      <div className="space-y-4">
        {/* Filters and search toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border shadow-xs">
          <div className="w-full sm:w-72">
            <SearchInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar cuadrilla, líder o especialidad..."
              className="h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                "TODAS",
                "ACTIVA",
                "EN_ESPERA",
                "PLANIFICADA",
                "SUSPENDIDA",
              ] as const
            ).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "TODAS"
                  ? "Todas"
                  : st === "ACTIVA"
                  ? "Activas"
                  : st === "EN_ESPERA"
                  ? "En Espera"
                  : st === "PLANIFICADA"
                  ? "Planificadas"
                  : "Suspendidas"}
              </button>
            ))}
          </div>
        </div>

        {/* Cuadrillas Grid */}
        {cuadrillasQuery.isPending ? (
          <Card className="p-12">
            <LoadingState label="Cargando cuadrillas de la obra..." />
          </Card>
        ) : cuadrillasQuery.isError ? (
          <Card className="p-8">
            <ErrorState
              message="No se pudieron cargar las cuadrillas."
              onRetry={() => void cuadrillasQuery.refetch()}
            />
          </Card>
        ) : filteredCuadrillas.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <HardHat className="size-6 text-muted-foreground/60" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {searchTerm || statusFilter !== "TODAS"
                ? "No se encontraron cuadrillas"
                : "No hay cuadrillas registradas en esta obra"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "TODAS"
                ? "Intenta cambiar el criterio de búsqueda o el filtro de estado."
                : "Crea tu primera cuadrilla para organizar a los trabajadores y planificar jornadas."}
            </p>
            {!searchTerm && statusFilter === "TODAS" && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="mt-4 gap-2 text-xs"
              >
                <Plus className="size-3.5" />
                <span>Crear Primera Cuadrilla</span>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCuadrillas.map((c) => (
              <CuadrillaCard
                key={c.id}
                cuadrilla={c}
                onSelect={(cuad) =>
                  navigate(`/obras/${obraId}/cuadrillas/${cuad.id}`)
                }
                onEdit={(cuad) => setEditCuadrilla(cuad)}
                onAsignarLider={(cuad) => setLiderCuadrilla(cuad)}
                onBaja={(cuad) => setBajaCuadrilla(cuad)}
                onReactivar={(cuad) => setReactivarCuadrilla(cuad)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Dialogs ────────────────────────────────────────────── */}
      <CreateCuadrillaDialog
        obraId={obraId}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <EditCuadrillaDialog
        obraId={obraId}
        cuadrilla={editCuadrilla}
        open={Boolean(editCuadrilla)}
        onOpenChange={(open) => !open && setEditCuadrilla(null)}
      />

      <BajaCuadrillaDialog
        obraId={obraId}
        cuadrilla={bajaCuadrilla}
        open={Boolean(bajaCuadrilla)}
        onOpenChange={(open) => !open && setBajaCuadrilla(null)}
      />

      <ReactivarCuadrillaDialog
        obraId={obraId}
        cuadrilla={reactivarCuadrilla}
        open={Boolean(reactivarCuadrilla)}
        onOpenChange={(open) => !open && setReactivarCuadrilla(null)}
      />

      <AsignarLiderDialog
        obraId={obraId}
        cuadrilla={liderCuadrilla}
        open={Boolean(liderCuadrilla)}
        onOpenChange={(open) => !open && setLiderCuadrilla(null)}
      />
    </div>
  );
}
