import { Calendar, Package, ShieldCheck, ShieldAlert } from "lucide-react";
import { useMisEntregas } from "../hooks/useEpp";
import { EmptyState, ErrorState, PageHeader } from "@/shared/components";
import {
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

function formatFecha(fecha: string): string {
  if (!fecha) return "-";
  const [datePart] = fecha.split("T");
  const parts = datePart.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return fecha;
}

export function MisEppsPage() {
  const { data: misEntregas = [], isLoading, isError, error, refetch } =
    useMisEntregas();

  const totalEntregas = misEntregas.length;
  const totalUnidades = misEntregas.reduce(
    (acc, item) => acc + (item.cantidadEntregada || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Encabezado informativo */}
      <PageHeader
        title="Elementos de Protección Personal (EPP)"
        description="Consultá el equipamiento y los elementos de protección personal que te han sido asignados por la empresa."
      />

      {/* Resumen de equipamiento */}
      {!isLoading && !isError && totalEntregas > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="shadow-soft">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Equipos Asignados
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalEntregas} {totalEntregas === 1 ? "entrega" : "entregas"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-success-soft text-success">
                <Package className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Total de Unidades Recibidas
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalUnidades} {totalUnidades === 1 ? "unidad" : "unidades"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Estado de carga */}
      {isLoading ? (
        <div className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-6 w-20" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-card border border-border bg-card p-6 shadow-soft">
          <ErrorState
            message={
              normalizeApiError(
                error,
                "No se pudo cargar tu historial de equipamiento de protección.",
              ).message
            }
            onRetry={() => refetch()}
          />
        </div>
      ) : misEntregas.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 shadow-soft">
          <EmptyState
            title="Aún no tienes elementos de protección personal asignados"
            description="Cuando el área de Higiene y Seguridad o tu supervisor te entregue equipamiento de protección (casco, botas, guantes, antiparras, etc.), quedará registrado en esta sección."
          />
        </div>
      ) : (
        /* Tabla de solo lectura */
        <div className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Fecha de Entrega</TableHead>
                <TableHead className="w-[50%]">EPP (Nombre)</TableHead>
                <TableHead className="w-[25%] text-center">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {misEntregas.map((entrega, index) => {
                const rowKey =
                  entrega.id ??
                  `${entrega.idEpp}-${entrega.fechaEntrega}-${index}`;

                return (
                  <TableRow key={rowKey}>
                    {/* Fecha de Entrega */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Calendar className="size-4 text-foreground-muted shrink-0" />
                        <span>{formatFecha(entrega.fechaEntrega)}</span>
                      </div>
                    </TableCell>

                    {/* EPP (Nombre) */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-control bg-muted text-foreground-muted">
                          <ShieldAlert className="size-4 text-primary" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {entrega.nombreEpp}
                        </span>
                      </div>
                    </TableCell>

                    {/* Cantidad */}
                    <TableCell className="text-center">
                      <span className="inline-flex items-center rounded-full bg-subtle px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {entrega.cantidadEntregada}{" "}
                        {entrega.cantidadEntregada === 1 ? "unidad" : "unidades"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default MisEppsPage;
