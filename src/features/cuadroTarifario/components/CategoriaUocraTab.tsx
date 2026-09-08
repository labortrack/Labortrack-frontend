import { useState } from "react";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  ActivarCategoriaUocraDialog,
  BajaCategoriaUocraDialog,
  CategoriaUocraFormDialog,
} from "./CategoriaUocraDialogs";
import { useCategoriasUocra } from "../hooks/useCategoriasUocra";
import type {
  CategoriaUocraResponseDto,
  TabFiltroCategoriaUocra,
} from "../types/categoriaUocra.types";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components";
import {
  Badge,
  Button,
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
import { formatCurrency } from "@/shared/utils/currency";
import { cn } from "@/shared/utils/cn";

const TABS: TabFiltroCategoriaUocra[] = ["Todos", "Activos", "Inactivos"];

const TIPO_LIQUIDACION_LABELS: Record<string, string> = {
  POR_HORA: "Por Hora",
  MENSUAL: "Mensual",
};

export function CategoriaUocraTab() {
  const [filtro, setFiltro] = useState<TabFiltroCategoriaUocra>("Activos");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] =
    useState<CategoriaUocraResponseDto | null>(null);
  const [bajaCategoria, setBajaCategoria] =
    useState<CategoriaUocraResponseDto | null>(null);
  const [activarCategoria, setActivarCategoria] =
    useState<CategoriaUocraResponseDto | null>(null);

  const query = useCategoriasUocra(filtro);
  const categorias = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full sm:w-auto items-center gap-1 rounded-lg border border-border bg-muted p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFiltro(tab)}
              className={cn(
                "flex-1 sm:flex-initial flex h-8 items-center justify-center gap-1.5 rounded-control px-3 text-xs font-semibold transition-all cursor-pointer",
                filtro === tab
                  ? "bg-card text-primary shadow-soft"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              <span>{tab}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto justify-center"
        >
          <Plus className="mr-1.5 size-4" />
          Agregar Categoría
        </Button>
      </div>

      {query.isPending ? (
        <LoadingState label="Cargando categorías..." />
      ) : query.isError ? (
        <ErrorState
          message={
            normalizeApiError(
              query.error,
              "No se pudieron obtener las categorías.",
            ).message
          }
          onRetry={() => void query.refetch()}
        />
      ) : categorias.length === 0 ? (
        <EmptyState
          title="No se encontraron categorías"
          description={`No hay categorías ${filtro !== "Todos" ? filtro.toLowerCase() : ""} registradas.`}
          action={
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Registrar primera categoría
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-subtle">
              <TableHead className="min-w-[200px]">
                Nombre de la Categoría
              </TableHead>
              <TableHead className="min-w-[140px]">
                Tipo de Liquidación
              </TableHead>
              <TableHead className="min-w-[140px]">
                Valor Hora Básico
              </TableHead>
              <TableHead className="min-w-[120px] w-[140px] text-center">
                Estado
              </TableHead>
              <TableHead className="min-w-[100px] w-[110px] text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.map((categoria) => (
              <TableRow
                key={categoria.id}
                className={cn(
                  "transition-colors",
                  !categoria.activo ? "bg-subtle/50" : "hover:bg-subtle/40",
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        categoria.activo ? "bg-success" : "bg-border-strong",
                      )}
                    />
                    <span
                      className={cn(
                        "tracking-wide",
                        categoria.activo
                          ? "font-semibold text-foreground"
                          : "text-foreground-muted line-through",
                      )}
                    >
                      {categoria.nombreCategoria}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {TIPO_LIQUIDACION_LABELS[categoria.tipoLiquidacion] ??
                    categoria.tipoLiquidacion}
                </TableCell>

                <TableCell>{formatCurrency(categoria.valorHoraBasico)}</TableCell>

                <TableCell className="text-center">
                  {categoria.activo ? (
                    <Badge variant="success">Activo</Badge>
                  ) : (
                    <Badge variant="neutral">Inactivo</Badge>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-foreground-muted hover:bg-primary-soft hover:text-primary"
                          onClick={() => setEditingCategoria(categoria)}
                          aria-label={`Editar ${categoria.nombreCategoria}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar categoría</TooltipContent>
                    </Tooltip>

                    {categoria.activo ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-foreground-muted hover:bg-error-soft hover:text-error"
                            onClick={() => setBajaCategoria(categoria)}
                            aria-label={`Dar de baja ${categoria.nombreCategoria}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Dar de baja</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-foreground-muted hover:bg-success-soft hover:text-success"
                            onClick={() => setActivarCategoria(categoria)}
                            aria-label={`Reactivar ${categoria.nombreCategoria}`}
                          >
                            <RotateCcw className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reactivar</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CategoriaUocraFormDialog
        categoria={null}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <CategoriaUocraFormDialog
        key={editingCategoria?.id ?? "edit-categoria"}
        categoria={editingCategoria}
        open={Boolean(editingCategoria)}
        onOpenChange={(open) => {
          if (!open) setEditingCategoria(null);
        }}
      />

      <BajaCategoriaUocraDialog
        key={bajaCategoria?.id ?? "baja-categoria"}
        categoria={bajaCategoria}
        onOpenChange={(open) => {
          if (!open) setBajaCategoria(null);
        }}
      />

      <ActivarCategoriaUocraDialog
        key={activarCategoria?.id ?? "activar-categoria"}
        categoria={activarCategoria}
        onOpenChange={(open) => {
          if (!open) setActivarCategoria(null);
        }}
      />
    </div>
  );
}
