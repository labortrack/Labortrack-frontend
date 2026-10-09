import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ClipboardCheck,
  History,
  Package,
  Plus,
  RotateCcw,
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
  Pagination,
  SearchInput,
} from "@/shared/components";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { normalizeSearchText } from "@/shared/utils/normalizeText";

export const STOCK_BAJO_UMBRAL = 5;

type EstadoFiltro = "activos" | "inactivos" | "todos";
type StockFiltro = "todos" | "bajo" | "sinStock";

const PAGE_SIZE = 10;

export function EppInventoryPage() {
  // Queries
  const { data: epps = [], isLoading, isError, error, refetch } = useEpps();

  // Mutations para cambio de estado
  const bajaMutation = useBajaEpp();
  const activarMutation = useActivarEpp();
  const isTogglingStatus = bajaMutation.isPending || activarMutation.isPending;

  // Estados locales para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoFiltro>("activos");
  const [stockFilter, setStockFilter] = useState<StockFiltro>("todos");

  // Estado de paginación (en memoria)
  const [page, setPage] = useState(0);

  // Debounce para el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handlers para filtros (resetean la página a 0 directamente)
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };

  const handleEstadoFilterChange = (val: EstadoFiltro) => {
    setEstadoFilter(val);
    setPage(0);
  };

  const handleStockFilterChange = (val: StockFiltro) => {
    setStockFilter(val);
    setPage(0);
  };

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

  // Conteo global de estados para las pestañas
  const counts = useMemo(() => {
    let activos = 0;
    let inactivos = 0;
    for (const item of epps) {
      if (item.activo) activos++;
      else inactivos++;
    }
    return {
      activos,
      inactivos,
      todos: epps.length,
    };
  }, [epps]);

  // Filtrado en memoria
  const filteredEpps = useMemo(() => {
    const normalizedTerm = normalizeSearchText(debouncedSearch);

    return epps.filter((item) => {
      // 1. Filtro por estado
      if (estadoFilter === "activos" && !item.activo) return false;
      if (estadoFilter === "inactivos" && item.activo) return false;

      // 2. Filtro por stock
      if (stockFilter === "sinStock" && item.stockEPP > 0) return false;
      if (
        stockFilter === "bajo" &&
        (item.stockEPP <= 0 || item.stockEPP > STOCK_BAJO_UMBRAL)
      ) {
        return false;
      }

      // 3. Búsqueda insensible a tildes y mayúsculas
      if (normalizedTerm) {
        const itemNombreNorm = normalizeSearchText(item.nombreEPP);
        const itemId = String(item.id);
        const matchesName = itemNombreNorm.includes(normalizedTerm);
        const matchesId = itemId.includes(normalizedTerm);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [epps, estadoFilter, stockFilter, debouncedSearch]);

  // Paginación en memoria con auto-ajuste seguro si el rango se reduce
  const totalElements = filteredEpps.length;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const safePage = totalPages > 0 ? Math.min(page, totalPages - 1) : 0;

  const paginatedEpps = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredEpps.slice(start, start + PAGE_SIZE);
  }, [filteredEpps, safePage]);

  // Verificar si hay algún filtro activo que no sea el por defecto
  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    estadoFilter !== "activos" ||
    stockFilter !== "todos";

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setEstadoFilter("activos");
    setStockFilter("todos");
    setPage(0);
  };

  // Métricas de inventario (resumen operativo superior)
  const totalEpps = epps.length;
  const activeEppsCount = counts.activos;
  const lowStockCount = useMemo(
    () => epps.filter((e) => e.activo && e.stockEPP > 0 && e.stockEPP <= STOCK_BAJO_UMBRAL).length,
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
                    Stock Crítico (≤ {STOCK_BAJO_UMBRAL})
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {lowStockCount}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros: Pestañas de Estado */}
          <div className="space-y-4">
            <Tabs
              value={estadoFilter}
              onValueChange={(val) => handleEstadoFilterChange(val as EstadoFiltro)}
            >
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="activos">
                  Activos ({counts.activos})
                </TabsTrigger>
                <TabsTrigger value="inactivos">
                  Inactivos ({counts.inactivos})
                </TabsTrigger>
                <TabsTrigger value="todos">
                  Todos ({counts.todos})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Barra de Filtros: Búsqueda, Filtro de Stock y Limpiar Filtros */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <SearchInput
                  placeholder="Buscar por nombre o ID de EPP..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full sm:w-72"
                />

                <select
                  aria-label="Filtro de stock"
                  value={stockFilter}
                  onChange={(e) => handleStockFilterChange(e.target.value as StockFiltro)}
                  className="h-10 rounded-control border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="todos">Stock: Todos</option>
                  <option value="bajo">Stock bajo (≤ {STOCK_BAJO_UMBRAL})</option>
                  <option value="sinStock">Sin stock (= 0)</option>
                </select>

                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <p className="text-xs text-foreground-muted">
                Mostrando {filteredEpps.length} de {totalEpps} elementos
              </p>
            </div>
          </div>

          {/* Tabla de Inventario y Paginación */}
          <div className="space-y-3">
            <EppTable
              epps={paginatedEpps}
              onEdit={handleOpenEdit}
              onRestock={handleOpenRestock}
              onToggleStatus={handlePromptToggleStatus}
              isTogglingId={togglingId}
              emptyTitle={
                totalEpps === 0
                  ? "No hay elementos de protección personal"
                  : "Sin resultados para los filtros actuales"
              }
              emptyDescription={
                totalEpps === 0
                  ? "Aún no se han registrado EPPs en el inventario. Podés agregar uno nuevo haciendo clic en 'Nuevo EPP'."
                  : "No se encontraron EPPs que coincidan con la búsqueda o el estado seleccionado."
              }
              onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
            />

            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </div>
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
