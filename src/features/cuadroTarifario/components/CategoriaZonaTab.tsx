import { useState } from "react";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  ActivarCategoriaZonaDialog,
  BajaCategoriaZonaDialog,
  CategoriaZonaFormDialog,
} from "./CategoriaZonaDialogs";
import { useCategoriaZonas } from "../hooks/useCategoriaZonas";
import type {
  CategoriaZonaResponseDto,
  TabFiltroCategoriaZona,
} from "../types/categoriaZona.types";
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

const TABS: TabFiltroCategoriaZona[] = ["Todos", "Activos", "Inactivos"];

export function CategoriaZonaTab() {
  const [filtro, setFiltro] = useState<TabFiltroCategoriaZona>("Activos");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingCelda, setEditingCelda] =
    useState<CategoriaZonaResponseDto | null>(null);
  const [bajaCelda, setBajaCelda] = useState<CategoriaZonaResponseDto | null>(
    null,
  );
  const [activarCelda, setActivarCelda] =
    useState<CategoriaZonaResponseDto | null>(null);

  const query = useCategoriaZonas(filtro);
  const celdas = query.data ?? [];

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
          Agregar Valor
        </Button>
      </div>

      {query.isPending ? (
        <LoadingState label="Cargando valores..." />
      ) : query.isError ? (
        <ErrorState
          message={
            normalizeApiError(query.error, "No se pudieron obtener los valores.")
              .message
          }
          onRetry={() => void query.refetch()}
        />
      ) : celdas.length === 0 ? (
        <EmptyState
          title="No se encontraron valores"
          description={`No hay valores ${filtro !== "Todos" ? filtro.toLowerCase() : ""} registrados. Necesitás al menos una zona y una categoría activas para crear uno.`}
          action={
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Registrar primer valor
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-subtle">
              <TableHead className="min-w-[180px]">Categoría UOCRA</TableHead>
              <TableHead className="min-w-[140px]">Zona</TableHead>
              <TableHead className="min-w-[140px]">
                Valor Hora Adicional
              </TableHead>
              <TableHead className="min-w-[160px]">
                Suma No Remunerativa
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
            {celdas.map((celda) => (
              <TableRow
                key={celda.id}
                className={cn(
                  "transition-colors",
                  !celda.activo ? "bg-subtle/50" : "hover:bg-subtle/40",
                )}
              >
                <TableCell
                  className={cn(
                    "font-medium",
                    !celda.activo && "text-foreground-muted line-through",
                  )}
                >
                  {celda.nombreCategoria}
                </TableCell>
                <TableCell>{celda.nombreZona}</TableCell>
                <TableCell>{formatCurrency(celda.valorHoraAdicional)}</TableCell>
                <TableCell>{formatCurrency(celda.sumaNoRemunerativa)}</TableCell>

                <TableCell className="text-center">
                  {celda.activo ? (
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
                          onClick={() => setEditingCelda(celda)}
                          aria-label={`Editar valor de ${celda.nombreCategoria} / ${celda.nombreZona}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar valor</TooltipContent>
                    </Tooltip>

                    {celda.activo ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-foreground-muted hover:bg-error-soft hover:text-error"
                            onClick={() => setBajaCelda(celda)}
                            aria-label={`Dar de baja valor de ${celda.nombreCategoria} / ${celda.nombreZona}`}
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
                            onClick={() => setActivarCelda(celda)}
                            aria-label={`Reactivar valor de ${celda.nombreCategoria} / ${celda.nombreZona}`}
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

      <CategoriaZonaFormDialog
        celda={null}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <CategoriaZonaFormDialog
        key={editingCelda?.id ?? "edit-celda"}
        celda={editingCelda}
        open={Boolean(editingCelda)}
        onOpenChange={(open) => {
          if (!open) setEditingCelda(null);
        }}
      />

      <BajaCategoriaZonaDialog
        key={bajaCelda?.id ?? "baja-celda"}
        celda={bajaCelda}
        onOpenChange={(open) => {
          if (!open) setBajaCelda(null);
        }}
      />

      <ActivarCategoriaZonaDialog
        key={activarCelda?.id ?? "activar-celda"}
        celda={activarCelda}
        onOpenChange={(open) => {
          if (!open) setActivarCelda(null);
        }}
      />
    </div>
  );
}
