import { useState } from "react";
import { Clock, Lock, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  ActivarPeriodoLiquidacionDialog,
  BajaPeriodoLiquidacionDialog,
  PeriodoLiquidacionFormDialog,
} from "./PeriodoLiquidacionDialogs";
import { usePeriodosLiquidacion } from "../hooks/usePeriodosLiquidacion";
import type {
  PeriodoLiquidacionResponseDto,
  TabFiltroPeriodo,
} from "../types/periodoLiquidacion.types";
import {
  ESTADO_PERIODO_BADGE_VARIANT,
  ESTADO_PERIODO_LABELS,
  TIPO_PERIODO_LABELS,
  esPeriodoEditable,
  formatFecha,
  formatFechaHora,
} from "../utils/periodoLiquidacion";
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
import { cn } from "@/shared/utils/cn";
import {
  useHistorialAuditoriaDialog,
  HistorialAuditoriaIconButton,
} from "@/features/auditoria";

const TABS: TabFiltroPeriodo[] = ["Todos", "Activos", "Inactivos"];


export function PeriodosLiquidacionTab() {
  const [filtro, setFiltro] = useState<TabFiltroPeriodo>("Activos");
  const { abrirHistorial, renderDialog } = useHistorialAuditoriaDialog();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingPeriodo, setEditingPeriodo] =
    useState<PeriodoLiquidacionResponseDto | null>(null);
  const [bajaPeriodo, setBajaPeriodo] =
    useState<PeriodoLiquidacionResponseDto | null>(null);
  const [activarPeriodo, setActivarPeriodo] =
    useState<PeriodoLiquidacionResponseDto | null>(null);

  const query = usePeriodosLiquidacion(filtro);
  const periodos = query.data ?? [];

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
          Agregar Nuevo
        </Button>
      </div>

      {query.isPending ? (
        <LoadingState label="Cargando períodos..." />
      ) : query.isError ? (
        <ErrorState
          message={
            normalizeApiError(
              query.error,
              "No se pudieron obtener los períodos de liquidación.",
            ).message
          }
          onRetry={() => void query.refetch()}
        />
      ) : periodos.length === 0 ? (
        <EmptyState
          title="No se encontraron períodos"
          description={`No hay períodos de liquidación ${filtro !== "Todos" ? filtro.toLowerCase() : ""} registrados.`}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-subtle">
              <TableHead className="min-w-[220px]">Descripción</TableHead>
              <TableHead className="min-w-[110px]">Tipo</TableHead>
              <TableHead className="min-w-[110px]">Fecha Inicio</TableHead>
              <TableHead className="min-w-[110px]">Fecha Fin</TableHead>
              <TableHead className="min-w-[170px]">
                Ejecución Automática
              </TableHead>
              <TableHead className="min-w-[130px] text-center">Estado</TableHead>
              <TableHead className="min-w-[100px] w-[110px] text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periodos.map((periodo) => {
              const editable = esPeriodoEditable(periodo);
              return (
                <TableRow
                  key={periodo.id}
                  className={cn(
                    "transition-colors",
                    !periodo.vigente ? "bg-subtle/50" : "hover:bg-subtle/40",
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          periodo.vigente ? "bg-success" : "bg-border-strong",
                        )}
                      />
                      <span
                        className={cn(
                          "tracking-wide",
                          periodo.vigente
                            ? "font-semibold text-foreground"
                            : "text-foreground-muted line-through",
                        )}
                      >
                        {periodo.descripcionPeriodoLiquidacion}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        periodo.tipoPeriodo === "QUINCENAL"
                          ? "primary"
                          : "neutral"
                      }
                    >
                      {TIPO_PERIODO_LABELS[periodo.tipoPeriodo]}
                    </Badge>
                  </TableCell>

                  <TableCell className="tabular-nums">
                    {formatFecha(periodo.fechaDesde)}
                  </TableCell>

                  <TableCell className="tabular-nums">
                    {formatFecha(periodo.fechaHasta)}
                  </TableCell>

                  <TableCell>
                    <span className="flex items-center gap-1.5 text-foreground-muted tabular-nums">
                      <Clock className="size-3.5 shrink-0" />
                      {formatFechaHora(periodo.fechaEjecucionPreLiquidacion)}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={
                        ESTADO_PERIODO_BADGE_VARIANT[
                          periodo.estadoPeriodoLiquidacion
                        ]
                      }
                    >
                      {ESTADO_PERIODO_LABELS[periodo.estadoPeriodoLiquidacion]}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <HistorialAuditoriaIconButton
                        onAbrir={() =>
                          abrirHistorial(
                            "periodo_liquidacion",
                            periodo.id,
                            periodo.descripcionPeriodoLiquidacion,
                          )
                        }
                        label={`Historial de ${periodo.descripcionPeriodoLiquidacion}`}
                      />

                      {editable ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-foreground-muted hover:bg-primary-soft hover:text-primary"
                                onClick={() => setEditingPeriodo(periodo)}
                                aria-label={`Editar ${periodo.descripcionPeriodoLiquidacion}`}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar período</TooltipContent>
                          </Tooltip>

                          {periodo.vigente ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-foreground-muted hover:bg-error-soft hover:text-error"
                                  onClick={() => setBajaPeriodo(periodo)}
                                  aria-label={`Dar de baja ${periodo.descripcionPeriodoLiquidacion}`}
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
                                  onClick={() => setActivarPeriodo(periodo)}
                                  aria-label={`Reactivar ${periodo.descripcionPeriodoLiquidacion}`}
                                >
                                  <RotateCcw className="size-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reactivar</TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              tabIndex={0}
                              className="flex size-8 items-center justify-center text-foreground-muted"
                              aria-label={`${periodo.descripcionPeriodoLiquidacion} no se puede modificar`}
                            >
                              <Lock className="size-3.5" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            Solo se pueden modificar períodos pendientes
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <PeriodoLiquidacionFormDialog
        periodo={null}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <PeriodoLiquidacionFormDialog
        key={editingPeriodo?.id ?? "edit-periodo"}
        periodo={editingPeriodo}
        open={Boolean(editingPeriodo)}
        onOpenChange={(open) => {
          if (!open) setEditingPeriodo(null);
        }}
      />

      <BajaPeriodoLiquidacionDialog
        key={bajaPeriodo?.id ?? "baja-periodo"}
        periodo={bajaPeriodo}
        onOpenChange={(open) => {
          if (!open) setBajaPeriodo(null);
        }}
      />

      <ActivarPeriodoLiquidacionDialog
        key={activarPeriodo?.id ?? "activar-periodo"}
        periodo={activarPeriodo}
        onOpenChange={(open) => {
          if (!open) setActivarPeriodo(null);
        }}
      />

      {renderDialog()}
    </div>
  );
}
