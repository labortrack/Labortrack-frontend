import { useState } from "react";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { ActivarZonaDialog, BajaZonaDialog, ZonaFormDialog } from "./ZonaDialogs";
import { useZonas } from "../hooks/useZonas";
import type { TabFiltroZona, ZonaResponseDto } from "../types/zona.types";
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

const TABS: TabFiltroZona[] = ["Todos", "Activos", "Inactivos"];

export function ZonaTab() {
  const [filtro, setFiltro] = useState<TabFiltroZona>("Activos");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingZona, setEditingZona] = useState<ZonaResponseDto | null>(null);
  const [bajaZona, setBajaZona] = useState<ZonaResponseDto | null>(null);
  const [activarZona, setActivarZona] = useState<ZonaResponseDto | null>(null);

  const query = useZonas(filtro);
  const zonas = query.data ?? [];

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
          Agregar Zona
        </Button>
      </div>

      {query.isPending ? (
        <LoadingState label="Cargando zonas..." />
      ) : query.isError ? (
        <ErrorState
          message={
            normalizeApiError(query.error, "No se pudieron obtener las zonas.")
              .message
          }
          onRetry={() => void query.refetch()}
        />
      ) : zonas.length === 0 ? (
        <EmptyState
          title="No se encontraron zonas"
          description={`No hay zonas ${filtro !== "Todos" ? filtro.toLowerCase() : ""} registradas.`}
          action={
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Registrar primera zona
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-subtle">
              <TableHead className="min-w-[220px]">
                Nombre de la Zona
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
            {zonas.map((zona) => (
              <TableRow
                key={zona.id}
                className={cn(
                  "transition-colors",
                  !zona.activo ? "bg-subtle/50" : "hover:bg-subtle/40",
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        zona.activo ? "bg-success" : "bg-border-strong",
                      )}
                    />
                    <span
                      className={cn(
                        "tracking-wide",
                        zona.activo
                          ? "font-semibold text-foreground"
                          : "text-foreground-muted line-through",
                      )}
                    >
                      {zona.nombreZona}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  {zona.activo ? (
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
                          onClick={() => setEditingZona(zona)}
                          aria-label={`Editar ${zona.nombreZona}`}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar zona</TooltipContent>
                    </Tooltip>

                    {zona.activo ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-foreground-muted hover:bg-error-soft hover:text-error"
                            onClick={() => setBajaZona(zona)}
                            aria-label={`Dar de baja ${zona.nombreZona}`}
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
                            onClick={() => setActivarZona(zona)}
                            aria-label={`Reactivar ${zona.nombreZona}`}
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

      <ZonaFormDialog zona={null} open={createOpen} onOpenChange={setCreateOpen} />

      <ZonaFormDialog
        key={editingZona?.id ?? "edit-zona"}
        zona={editingZona}
        open={Boolean(editingZona)}
        onOpenChange={(open) => {
          if (!open) setEditingZona(null);
        }}
      />

      <BajaZonaDialog
        key={bajaZona?.id ?? "baja-zona"}
        zona={bajaZona}
        onOpenChange={(open) => {
          if (!open) setBajaZona(null);
        }}
      />

      <ActivarZonaDialog
        key={activarZona?.id ?? "activar-zona"}
        zona={activarZona}
        onOpenChange={(open) => {
          if (!open) setActivarZona(null);
        }}
      />
    </div>
  );
}
