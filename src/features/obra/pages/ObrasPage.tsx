import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RotateCcw, Settings2 } from "lucide-react";
import { ObraCard } from "../components/ObraCard";
import {
  CloseObraDialog,
  CreateObraDialog,
  EditObraDialog,
  TransicionarEstadoObraDialog,
} from "../components/ObraDialogs";
import { EstadoBadge } from "../estado/components/EstadoBadge";
import { useObras } from "../hooks/useObras";
import type { ObraResponseDto } from "../types/obra.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SearchInput,
} from "@/shared/components";
import { Button, Card, Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export default function ObrasPage() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<ObraResponseDto | null>(null);
  const [closingObra, setClosingObra] = useState<ObraResponseDto | null>(null);
  const [transitioningObra, setTransitioningObra] =
    useState<ObraResponseDto | null>(null);

  const obrasQuery = useObras();
  const obras = obrasQuery.data ?? [];

  const obrasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return obras;
    return obras.filter(
      (o) =>
        o.nombreObra.toLowerCase().includes(q) ||
        o.localidad.toLowerCase().includes(q) ||
        o.provincia.toLowerCase().includes(q) ||
        o.nomenclatura.toLowerCase().includes(q) ||
        o.estadoActual.toLowerCase().includes(q),
    );
  }, [obras, busqueda]);

  // Breakdown of active status frequencies
  const estadosSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of obras) {
      const st = o.estadoActual;
      counts[st] = (counts[st] ?? 0) + 1;
    }
    return Object.entries(counts);
  }, [obras]);

  return (
    <div className="space-y-6">
      {/* ── Module Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Obras y Frentes de Trabajo"
        description="Control logístico, frentes de obra y centros de costos de los proyectos."
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => navigate("/obras/configuracion")}
              className="w-full sm:w-auto justify-center"
            >
              <Settings2 className="mr-1.5 size-4" />
              Configuración de Estados
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="w-full sm:w-auto justify-center"
            >
              <Plus className="mr-1.5 size-4" />
              Nueva Obra
            </Button>
          </div>
        }
      />

      {/* ── Search toolbar ────────────────────────────────────────── */}
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar obras nomenclatura"
            aria-label="Buscar obras"
          />
        </div>
        {busqueda ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                <RotateCcw className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Limpiar búsqueda</TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      {/* ── Results summary + Estado breakdown ───────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium text-foreground-muted">
          {obrasFiltradas.length} obra{obrasFiltradas.length !== 1 ? "s" : ""}
          {busqueda ? (
            <span className="ml-1">— filtrando por "{busqueda}"</span>
          ) : null}
        </span>
        {estadosSummary.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {estadosSummary.map(([estadoNombre, count]) => (
              <span
                key={estadoNombre}
                className="inline-flex items-center gap-1.5 rounded-full bg-subtle px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <span className="font-bold">{count}</span>
                <EstadoBadge
                  estado={estadoNombre}
                  className="py-0 px-1 text-[11px]"
                />
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Data Grid ────────────────────────────────────────────── */}
      {obrasQuery.isPending ? (
        <Card className="p-8">
          <LoadingState label="Cargando frentes de obra..." />
        </Card>
      ) : obrasQuery.isError ? (
        <Card className="p-8">
          <ErrorState
            message={
              normalizeApiError(
                obrasQuery.error,
                "No se pudieron obtener las obras.",
              ).message
            }
            onRetry={() => void obrasQuery.refetch()}
          />
        </Card>
      ) : obrasFiltradas.length === 0 ? (
        <Card>
          <EmptyState
            title="No se encontraron obras"
            description={
              busqueda
                ? "Probá cambiando el término de búsqueda."
                : "No hay obras registradas en el sistema."
            }
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                Registrar primer frente de obra
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {obrasFiltradas.map((obra) => (
            <ObraCard
              key={obra.id}
              obra={obra}
              onEdit={setEditingObra}
              onClose={setClosingObra}
              onChangeEstado={setTransitioningObra}
              onDetalle={(o) => navigate(`/obras/${o.id}`)}
            />
          ))}
        </div>
      )}

      {/* ── Modales ────────────────────────────────────────────── */}
      <CreateObraDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <EditObraDialog
        key={editingObra?.id ?? "edit-obra"}
        obra={editingObra}
        onOpenChange={(open) => {
          if (!open) setEditingObra(null);
        }}
      />

      <CloseObraDialog
        key={closingObra?.id ?? "close-obra"}
        obra={closingObra}
        onOpenChange={(open) => {
          if (!open) setClosingObra(null);
        }}
      />

      <TransicionarEstadoObraDialog
        key={transitioningObra?.id ?? "trans-obra"}
        obra={transitioningObra}
        onOpenChange={(open) => {
          if (!open) setTransitioningObra(null);
        }}
      />
    </div>
  );
}
