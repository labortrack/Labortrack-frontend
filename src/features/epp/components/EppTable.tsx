import { Package, PackagePlus, Pencil, RefreshCw } from "lucide-react";
import type { Epp } from "../types/epp.types";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { EmptyState } from "@/shared/components";

interface EppTableProps {
  epps: Epp[];
  onEdit: (epp: Epp) => void;
  onRestock: (epp: Epp) => void;
  onToggleStatus: (epp: Epp) => void;
  isTogglingId?: number | null;
}

export function EppTable({
  epps,
  onEdit,
  onRestock,
  onToggleStatus,
  isTogglingId,
}: EppTableProps) {
  if (epps.length === 0) {
    return (
      <div className="rounded-card border border-border bg-card p-6 shadow-soft">
        <EmptyState
          title="No hay elementos de protección personal"
          description="Aún no se han registrado EPPs en el inventario. Podés agregar uno nuevo haciendo clic en 'Nuevo EPP'."
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Nombre</TableHead>
            <TableHead className="w-[20%] text-center">Stock Disponible</TableHead>
            <TableHead className="w-[20%] text-center">Estado</TableHead>
            <TableHead className="w-[20%] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {epps.map((epp) => {
            const isToggling = isTogglingId === epp.id;
            const isOutOfStock = epp.stockEPP <= 0;
            const isLowStock = epp.stockEPP > 0 && epp.stockEPP <= 5;

            return (
              <TableRow key={epp.id} className={!epp.activo ? "opacity-75" : undefined}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-control bg-muted text-foreground-muted">
                      <Package className="size-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">
                        {epp.nombreEPP}
                      </span>
                      <p className="text-xs text-foreground-muted">ID: #{epp.id}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isOutOfStock
                        ? "bg-error-soft text-error-strong"
                        : isLowStock
                          ? "bg-warning-soft text-warning"
                          : "bg-subtle text-foreground"
                    }`}
                  >
                    {epp.stockEPP} {epp.stockEPP === 1 ? "unidad" : "unidades"}
                  </span>
                </TableCell>

                <TableCell className="text-center">
                  <Badge variant={epp.activo ? "success" : "neutral"}>
                    {epp.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex items-center justify-end gap-1">
                    {/* Botón: Editar */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-foreground-muted hover:text-primary"
                      title="Editar EPP"
                      aria-label={`Editar ${epp.nombreEPP}`}
                      onClick={() => onEdit(epp)}
                    >
                      <Pencil className="size-4" />
                    </Button>

                    {/* Botón: Reponer Stock */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-foreground-muted hover:text-accent-hover"
                      title="Reponer Stock"
                      aria-label={`Reponer stock para ${epp.nombreEPP}`}
                      onClick={() => onRestock(epp)}
                    >
                      <PackagePlus className="size-4" />
                    </Button>

                    {/* Botón: Cambiar Estado (Activar/Desactivar) */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`size-8 p-0 ${
                        epp.activo
                          ? "text-foreground-muted hover:text-error"
                          : "text-foreground-muted hover:text-success"
                      }`}
                      title={epp.activo ? "Desactivar EPP" : "Activar EPP"}
                      aria-label={
                        epp.activo
                          ? `Desactivar ${epp.nombreEPP}`
                          : `Activar ${epp.nombreEPP}`
                      }
                      disabled={isToggling}
                      onClick={() => onToggleStatus(epp)}
                    >
                      <RefreshCw
                        className={`size-4 ${isToggling ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
