import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  CreateEstadoObraDialog,
  DeactivateEstadoObraDialog,
  EditEstadoObraDialog,
} from "../components/EstadoObraDialogs";
import { useEstadosObra } from "../hooks/useEstadosObra";
import type {
  EstadoObraResponseDto,
  TabFiltroEstadoObra,
} from "../types/estadoObra.types";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import {
  Badge,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";

const TABS: TabFiltroEstadoObra[] = ["Todos", "Activos", "Inactivos"];

export default function ConfiguracionObrasPage() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<TabFiltroEstadoObra>("Activos");

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEstado, setEditingEstado] =
    useState<EstadoObraResponseDto | null>(null);
  const [deletingEstado, setDeletingEstado] =
    useState<EstadoObraResponseDto | null>(null);

  const query = useEstadosObra(filtro);

  const estados = query.data ?? [];

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb / Back ──────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/obras")}
          className="group mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-primary cursor-pointer"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a Obras</span>
        </button>

        {/* ── Page Header ─────────────────────────────────────── */}
        <PageHeader
          title="Configuración Global de Estados de Obra"
          description="Administre el catálogo de estados disponibles para los proyectos civiles."
          actions={
            <Button
              onClick={() => setCreateOpen(true)}
              className="shrink-0"
            >
              <Plus className="mr-1.5 size-4" />
              Agregar Estado de Obra
            </Button>
          }
        />
      </div>

      {/* ── Filter Tabs + Counter ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFiltro(tab)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-control px-3 text-xs font-semibold transition-all",
                filtro === tab
                  ? "bg-card text-primary shadow-soft"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              <span>{tab}</span>
            </button>
          ))}
        </div>

        <span className="text-xs font-medium text-foreground-muted">
          {estados.length} estado{estados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Data Grid ─────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {query.isPending ? (
          <LoadingState label="Cargando estados de obra..." />
        ) : query.isError ? (
          <ErrorState
            message={
              normalizeApiError(
                query.error,
                "No se pudieron obtener los estados de obra.",
              ).message
            }
            onRetry={() => void query.refetch()}
          />
        ) : estados.length === 0 ? (
          <EmptyState
            title="No se encontraron estados de obra"
            description={`No hay estados ${filtro !== "Todos" ? filtro.toLowerCase() : ""} registrados.`}
            action={
              <Button variant="outline" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Registrar primer estado
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-subtle">
                <TableHead className="w-[240px]">Nombre del Estado</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[140px] text-center">
                  Estado Lógico
                </TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estados.map((estado) => {
                const isInactivo = filtro === "Inactivos";

                return (
                  <TableRow
                    key={estado.id}
                    className={cn(
                      "transition-colors",
                      isInactivo ? "bg-subtle/50" : "hover:bg-subtle/40",
                    )}
                  >
                    {/* Nombre */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            isInactivo ? "bg-border-strong" : "bg-success",
                          )}
                        />
                        <span
                          className={cn(
                            "tracking-wide",
                            isInactivo
                              ? "text-foreground-muted line-through"
                              : "font-semibold text-foreground",
                          )}
                        >
                          {estado.nombreEstadoObra}
                        </span>
                      </div>
                    </TableCell>

                    {/* Descripción */}
                    <TableCell className="text-foreground-muted">
                      {estado.descripcionEstadoObra || (
                        <span className="italic text-foreground-muted/60">
                          Sin descripción
                        </span>
                      )}
                    </TableCell>

                    {/* Estado lógico */}
                    <TableCell className="text-center">
                      {!isInactivo ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="neutral">Inactivo</Badge>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-foreground-muted hover:bg-primary-soft hover:text-primary"
                              onClick={() => setEditingEstado(estado)}
                              aria-label={`Editar ${estado.nombreEstadoObra}`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar descripción</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isInactivo}
                              className="size-8 text-foreground-muted hover:bg-error-soft hover:text-error disabled:opacity-30"
                              onClick={() => setDeletingEstado(estado)}
                              aria-label={`Dar de baja ${estado.nombreEstadoObra}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isInactivo ? "Ya está inactivo" : "Dar de baja"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Modales ────────────────────────────────────────────── */}
      <CreateEstadoObraDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <EditEstadoObraDialog
        key={editingEstado?.id ?? "edit-estado"}
        estado={editingEstado}
        onOpenChange={(open) => {
          if (!open) setEditingEstado(null);
        }}
      />

      <DeactivateEstadoObraDialog
        key={deletingEstado?.id ?? "deactivate-estado"}
        estado={deletingEstado}
        onOpenChange={(open) => {
          if (!open) setDeletingEstado(null);
        }}
      />
    </div>
  );
}
