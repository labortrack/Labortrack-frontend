import { ArrowRight, UserX2 } from "lucide-react";
import type { EmpleadoResumenResponseDto } from "../types/legajo.types";
import { CATEGORIA_LABELS, ESTADO_LABELS } from "../types/legajo.types";
import { InitialsAvatar, Pagination } from "@/shared/components";
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
            const initials =
              `${empleado.nombre.at(0) ?? ""}${empleado.apellido.at(0) ?? ""}`.toUpperCase();

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
                    {empleado.fotoPerfilKey ? (
                      <img
                        src={empleado.fotoPerfilKey}
                        alt={`${empleado.nombre} ${empleado.apellido}`}
                        className="size-9 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <InitialsAvatar initials={initials} />
                    )}
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
    </div>
  );
}
