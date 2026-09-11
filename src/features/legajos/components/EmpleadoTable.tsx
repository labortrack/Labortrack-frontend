import { useState } from "react";
import { ArrowRight, Pencil, RotateCcw, Trash2, UserX2 } from "lucide-react";
import type { EmpleadoResumenResponseDto } from "../types/legajo.types";
import { CATEGORIA_LABELS, ESTADO_LABELS } from "../types/legajo.types";
import { AvatarMinio } from "./AvatarMinio";
import { BajaEmpleadoModal } from "./BajaEmpleadoModal";
import { ReactivarEmpleadoModal } from "./ReactivarEmpleadoModal";
import { EditarEmpleadoDialog } from "./EditarEmpleadoDialog";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { Pagination } from "@/shared/components";
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

interface EmpleadoTableProps {
  data: EmpleadoResumenResponseDto[];
  totalElements: number;
  totalPages: number;
  page: number;
  onPageChange: (page: number) => void;
  onSelectEmpleado: (id: number) => void;
  isLoading?: boolean;
}

const estadoVariantMap: Record<
  string,
  "success" | "primary" | "warning" | "error" | "neutral"
> = {
  ACTIVO: "success",
  EN_OBRA: "primary",
  LICENCIA: "warning",
  SUSPENDIDO: "warning",
  INACTIVO: "neutral",
};

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("-");
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

export function EmpleadoTable({
  data,
  totalElements,
  totalPages,
  page,
  onPageChange,
  onSelectEmpleado,
  isLoading,
}: EmpleadoTableProps) {
  const [isBajaModalOpen, setIsBajaModalOpen] = useState(false);
  const [empleadoIdParaBaja, setEmpleadoIdParaBaja] = useState<number | null>(null);
  const [empleadoIdParaReactivar, setEmpleadoIdParaReactivar] = useState<
    number | null
  >(null);
  const [empleadoParaEditar, setEmpleadoParaEditar] =
    useState<EmpleadoResumenResponseDto | null>(null);

  const user = useSessionStore((state) => state.user);
  const canBaja = user?.rol === "ROLE_ADMIN" || user?.rol === "ROLE_RRHH";

  const empleadoSeleccionado = data.find((e) => e.id === empleadoIdParaBaja);
  const empleadoParaReactivar = data.find(
    (e) => e.id === empleadoIdParaReactivar,
  );

  if (!isLoading && data.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-card border border-border bg-card p-8 text-center shadow-soft">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-subtle text-foreground-muted">
          <UserX2 className="size-8 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Sin coincidencias
        </h3>
        <p className="mt-1 max-w-md text-sm text-foreground-muted">
          No se encontraron empleados que coincidan con los filtros aplicados
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>DNI</TableHead>
            <TableHead>Nombre y Apellido</TableHead>
            <TableHead>Categoría Actual</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Ingreso</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((empleado) => {


            return (
              <TableRow
                key={empleado.id}
                onClick={() => onSelectEmpleado(empleado.id)}
                className="cursor-pointer hover:bg-subtle/80"
              >
                <TableCell className="font-mono text-xs font-semibold text-foreground">
                  {empleado.dni}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <AvatarMinio
                      empleadoId={empleado.id}
                      nombre={empleado.nombre}
                      apellido={empleado.apellido}
                      fotoPerfilKey={empleado.fotoPerfilKey}
                      size="md"
                      allowZoom
                    />
                    <div>
                      <div className="font-medium text-foreground">
                        {empleado.apellido}, {empleado.nombre}
                      </div>
                      <div className="text-xs text-foreground-muted">
                        IERIC: {empleado.numeroIeric || "-"} · CUIL: {empleado.cuil}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">
                  {CATEGORIA_LABELS[empleado.categoriaActual] ||
                    empleado.categoriaActual}
                </TableCell>
                <TableCell>
                  <Badge variant={estadoVariantMap[empleado.estadoActual] || "neutral"}>
                    {ESTADO_LABELS[empleado.estadoActual] ||
                      empleado.estadoActual}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground-muted">
                  {formatDate(empleado.fechaIngreso)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmpleado(empleado.id);
                      }}
                      className="text-primary hover:text-primary-hover"
                    >
                      Ver Ficha 360°
                      <ArrowRight className="size-4 ml-1" />
                    </Button>

                    {canBaja && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmpleadoParaEditar(empleado);
                            }}
                            className="size-8 text-foreground-muted hover:bg-primary-soft hover:text-primary"
                            aria-label="Editar legajo"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar legajo</TooltipContent>
                      </Tooltip>
                    )}

                    {canBaja && empleado.estadoActual === "INACTIVO" ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmpleadoIdParaReactivar(empleado.id);
                            }}
                            className="size-8 text-foreground-muted hover:bg-success-soft hover:text-success"
                            aria-label="Reactivar empleado"
                          >
                            <RotateCcw className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reactivar</TooltipContent>
                      </Tooltip>
                    ) : canBaja ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmpleadoIdParaBaja(empleado.id);
                              setIsBajaModalOpen(true);
                            }}
                            className="size-8 text-foreground-muted hover:bg-error-soft hover:text-error"
                            aria-label="Dar de baja empleado"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Dar de baja</TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={onPageChange}
        disabled={isLoading}
      />

      <BajaEmpleadoModal
        empleadoId={empleadoIdParaBaja}
        isOpen={isBajaModalOpen}
        onClose={() => {
          setIsBajaModalOpen(false);
          setEmpleadoIdParaBaja(null);
        }}
        nombreEmpleado={
          empleadoSeleccionado
            ? `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellido}`
            : undefined
        }
      />

      <ReactivarEmpleadoModal
        empleadoId={empleadoIdParaReactivar}
        onClose={() => setEmpleadoIdParaReactivar(null)}
        nombreEmpleado={
          empleadoParaReactivar
            ? `${empleadoParaReactivar.nombre} ${empleadoParaReactivar.apellido}`
            : undefined
        }
      />

      {empleadoParaEditar ? (
        <EditarEmpleadoDialog
          empleadoId={empleadoParaEditar.id}
          nombreCompleto={`${empleadoParaEditar.nombre} ${empleadoParaEditar.apellido}`}
          open={Boolean(empleadoParaEditar)}
          onOpenChange={(open) => {
            if (!open) setEmpleadoParaEditar(null);
          }}
        />
      ) : null}
    </div>
  );
}
