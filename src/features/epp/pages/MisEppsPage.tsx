import { Calendar, FileText, Package, ShieldCheck, ShieldAlert } from "lucide-react";
import { useMisRemitos } from "../hooks/useEpp";
import { useAbrirRemitoEntrega } from "../hooks/useAbrirRemitoEntrega";
import type { Remito } from "../types/epp.types";
import { formatNumeroRemito } from "../utils/remito";
import { EmptyState, ErrorState, PageHeader } from "@/shared/components";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Spinner,
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

/**
 * Abre el PDF de un remito propio. Si todavía no se generó, avisa que la primera apertura
 * puede tardar; el backend responde 403 si el remito no es del operario.
 */
function VerRemitoButton({ remito }: { remito: Remito }) {
  const { abrir, isPending } = useAbrirRemitoEntrega();
  const textoPendiente = remito.pdfGenerado ? "Abriendo..." : "Generando remito...";

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void abrir(remito.id)}
        disabled={isPending}
      >
        {isPending ? (
          <Spinner className="size-3.5" label={textoPendiente} />
        ) : (
          <FileText className="size-3.5" />
        )}
        {isPending ? textoPendiente : "Ver remito"}
      </Button>
      {!remito.pdfGenerado ? (
        <p className="max-w-[14rem] text-right text-xs text-foreground-muted">
          Se genera al abrirlo por primera vez; puede tardar unos segundos.
        </p>
      ) : null}
    </div>
  );
}

export function MisEppsPage() {
  const { data: misRemitos = [], isLoading, isError, error, refetch } =
    useMisRemitos();

  const totalRemitos = misRemitos.length;
  const totalUnidades = misRemitos.reduce(
    (acc, remito) =>
      acc + remito.items.reduce((suma, item) => suma + (item.cantidad || 0), 0),
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
      {!isLoading && !isError && totalRemitos > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="shadow-soft">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Remitos Recibidos
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalRemitos} {totalRemitos === 1 ? "remito" : "remitos"}
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
      ) : misRemitos.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 shadow-soft">
          <EmptyState
            title="Aún no tienes elementos de protección personal asignados"
            description="Cuando el área de Higiene y Seguridad o tu supervisor te entregue equipamiento de protección (casco, botas, guantes, antiparras, etc.), quedará registrado en esta sección."
          />
        </div>
      ) : (
        /* Tabla de solo lectura: un remito por fila con sus ítems */
        <div className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Fecha de Entrega</TableHead>
                <TableHead className="w-[15%]">Remito N°</TableHead>
                <TableHead className="w-[40%]">EPP Recibidos</TableHead>
                <TableHead className="w-[25%] text-right">Remito</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {misRemitos.map((remito) => (
                <TableRow key={remito.id}>
                  {/* Fecha de Entrega */}
                  <TableCell>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Calendar className="size-4 text-foreground-muted shrink-0" />
                      <span>{formatFecha(remito.fechaEntrega)}</span>
                    </div>
                  </TableCell>

                  {/* Remito N° */}
                  <TableCell>
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatNumeroRemito(remito.id)}
                    </span>
                  </TableCell>

                  {/* EPP Recibidos */}
                  <TableCell>
                    <ul className="space-y-1.5">
                      {remito.items.map((item) => (
                        <li key={item.eppId} className="flex items-center gap-2">
                          <ShieldAlert className="size-4 shrink-0 text-primary" />
                          <span className="font-semibold text-foreground">
                            {item.nombreEpp}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-subtle px-2 py-0.5 text-xs font-semibold text-foreground">
                            {item.cantidad} {item.cantidad === 1 ? "unidad" : "unidades"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>

                  {/* Remito */}
                  <TableCell className="text-right">
                    <VerRemitoButton remito={remito} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default MisEppsPage;
