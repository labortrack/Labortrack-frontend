import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ClipboardCheck,
  History,
  Package,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { Epp } from "../types/epp.types";
import { useActivarEpp, useBajaEpp, useEpps } from "../hooks/useEpp";
import { EppTable } from "../components/EppTable";
import { EppFormModal } from "../components/modals/EppFormModal";
import { EppRestockModal } from "../components/modals/EppRestockModal";
import { EppDeliveryModal } from "../components/modals/EppDeliveryModal";
import {
  ConfirmDialog,
  ErrorState,
  PageHeader,
  SearchInput,
} from "@/shared/components";
import { Button, Card, CardContent, Skeleton } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export function EppInventoryPage() {
  // Queries
  const { data: epps = [], isLoading, isError, error, refetch } = useEpps();

  // Mutations para cambio de estado
  const bajaMutation = useBajaEpp();
  const activarMutation = useActivarEpp();
  const isTogglingStatus = bajaMutation.isPending || activarMutation.isPending;

  // Estados locales para filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedEppForEdit, setSelectedEppForEdit] = useState<Epp | null>(null);

  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedEppForRestock, setSelectedEppForRestock] = useState<Epp | null>(
    null,
  );

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [initialEppIdForDelivery, setInitialEppIdForDelivery] = useState<
    number | undefined
  >();

  // Estado para confirmación de cambio de estado
  const [eppToToggle, setEppToToggle] = useState<Epp | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Filtrado en memoria
  const filteredEpps = useMemo(() => {
    if (!searchTerm.trim()) return epps;
    const term = searchTerm.toLowerCase().trim();
    return epps.filter(
      (item) =>
        item.nombreEPP.toLowerCase().includes(term) ||
        String(item.id).includes(term),
    );
  }, [epps, searchTerm]);

  // Métricas de inventario
  const totalEpps = epps.length;
  const activeEppsCount = useMemo(
    () => epps.filter((e) => e.activo).length,
    [epps],
  );
  const lowStockCount = useMemo(
    () => epps.filter((e) => e.activo && e.stockEPP <= 5).length,
    [epps],
  );

  // Manejadores de acciones de fila
  const handleOpenCreate = () => {
    setSelectedEppForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (epp: Epp) => {
    setSelectedEppForEdit(epp);
    setIsFormModalOpen(true);
  };

  const handleOpenRestock = (epp: Epp) => {
    setSelectedEppForRestock(epp);
    setIsRestockModalOpen(true);
  };

  const handleOpenDelivery = (eppId?: number) => {
    setInitialEppIdForDelivery(eppId);
    setIsDeliveryModalOpen(true);
  };

  const handlePromptToggleStatus = (epp: Epp) => {
    setEppToToggle(epp);
  };

  const handleConfirmToggleStatus = async () => {
    if (!eppToToggle) return;
    const { id, nombreEPP, activo } = eppToToggle;
    setTogglingId(id);

    try {
      if (activo) {
        await bajaMutation.mutateAsync(id);
        toast.success("EPP desactivado", {
          description: `"${nombreEPP}" ha sido dado de baja.`,
        });
      } else {
        await activarMutation.mutateAsync(id);
        toast.success("EPP activado", {
          description: `"${nombreEPP}" ahora está disponible para entregas.`,
        });
      }
      setEppToToggle(null);
    } catch (err) {
      const normalized = normalizeApiError(
        err,
        activo
          ? "No se pudo dar de baja el EPP."
          : "No se pudo activar el EPP.",
      );
      toast.error("Error al cambiar estado", {
        description: normalized.message,
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con acciones principales */}
      <PageHeader
        title="Elementos de Protección Personal (EPP)"
        description="Inventario, reposición de stock en pañol y registro de entregas a operarios."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link to="/higiene-seguridad/historial">
                <History className="size-4" />
                Historial de Entregas
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleOpenDelivery()}
              className="flex items-center gap-2"
            >
              <ClipboardCheck className="size-4" />
              Registrar Entrega
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenCreate}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              Nuevo EPP
            </Button>
          </div>
        }
      />

      {/* Skeletons de Carga */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-72 rounded-control" />
          </div>
          <Skeleton className="h-80 w-full rounded-card" />
        </div>
      ) : isError ? (
        <div className="rounded-card border border-border bg-card p-6 shadow-soft">
          <ErrorState
            message={
              normalizeApiError(error, "No se pudo cargar el inventario de EPP.")
                .message
            }
            onRetry={() => refetch()}
          />
        </div>
      ) : (
        <>
          {/* Tarjetas de Resumen Operativo */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="shadow-soft">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
                  <Package className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Total Registrados
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalEpps}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-success-soft text-success">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    EPPs Habilitados
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {activeEppsCount}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-warning-soft text-warning">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Stock Crítico (≤ 5)
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {lowStockCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              placeholder="Buscar por nombre o ID de EPP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-foreground-muted">
              Mostrando {filteredEpps.length} de {totalEpps} elementos
            </p>
          </div>

          {/* Tabla de Inventario */}
          <EppTable
            epps={filteredEpps}
            onEdit={handleOpenEdit}
            onRestock={handleOpenRestock}
            onToggleStatus={handlePromptToggleStatus}
            isTogglingId={togglingId}
          />
        </>
      )}

      {/* Modal: Alta / Modificación */}
      <EppFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        epp={selectedEppForEdit}
      />

      {/* Modal: Reponer Stock */}
      <EppRestockModal
        open={isRestockModalOpen}
        onOpenChange={setIsRestockModalOpen}
        epp={selectedEppForRestock}
      />

      {/* Modal: Registrar Entrega */}
      <EppDeliveryModal
        open={isDeliveryModalOpen}
        onOpenChange={setIsDeliveryModalOpen}
        initialEppId={initialEppIdForDelivery}
      />

      {/* Modal: Confirmación de Activar / Desactivar EPP */}
      <ConfirmDialog
        open={Boolean(eppToToggle)}
        onOpenChange={(open) => !open && setEppToToggle(null)}
        title={
          eppToToggle?.activo
            ? "Desactivar Elemento de Protección"
            : "Activar Elemento de Protección"
        }
        description={
          eppToToggle?.activo
            ? `¿Estás seguro de que deseás dar de baja "${eppToToggle.nombreEPP}"? El elemento dejará de estar disponible para registrar entregas.`
            : `¿Deseás reactivar "${eppToToggle?.nombreEPP}"? Se habilitará nuevamente para la entrega a los empleados.`
        }
        confirmLabel={eppToToggle?.activo ? "Desactivar" : "Activar"}
        destructive={eppToToggle?.activo}
        pending={isTogglingStatus}
        onConfirm={handleConfirmToggleStatus}
      />
    </div>
  );
}

export default EppInventoryPage;
