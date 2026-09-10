import { Pencil } from "lucide-react";
import { useCuadroTarifario } from "../hooks/useCuadroTarifario";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components";
import {
  Button,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { formatCurrency } from "@/shared/utils/currency";
import { cn } from "@/shared/utils/cn";

export function CuadroTarifarioMatrix({
  onEditar,
}: {
  onEditar: () => void;
}) {
  const query = useCuadroTarifario();
  const cuadro = query.data;
  const zonas = cuadro?.zonas ?? [];
  const filas = cuadro?.filas ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-foreground">
            Configuración Cuadro Tarifario UOCRA
          </h2>
          <p className="mt-0.5 text-sm text-foreground-muted">
            Valores vigentes por categoría y zona.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onEditar}
          className="w-full sm:w-auto justify-center"
        >
          <Pencil className="mr-1.5 size-4" />
          Editar Cuadro Tarifario
        </Button>
      </CardHeader>

      {query.isPending ? (
        <LoadingState label="Cargando cuadro tarifario..." />
      ) : query.isError ? (
        <ErrorState
          message={
            normalizeApiError(
              query.error,
              "No se pudo obtener el cuadro tarifario.",
            ).message
          }
          onRetry={() => void query.refetch()}
        />
      ) : zonas.length === 0 || filas.length === 0 ? (
        <EmptyState
          title="Todavía no hay cuadro tarifario para mostrar"
          description="Necesitás al menos una zona y una categoría UOCRA activas para armar el cuadro."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-subtle">
              <TableHead className="min-w-[200px]">Categoría UOCRA</TableHead>
              <TableHead className="min-w-[140px]">
                Valor Hora Básico
              </TableHead>
              <TableHead className="min-w-[140px]">Zona</TableHead>
              <TableHead className="min-w-[140px]">
                Valor Hora Adicional
              </TableHead>
              <TableHead className="min-w-[160px]">
                Suma No Remunerativa
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.flatMap((fila) =>
              zonas.map((zona, zonaIndex) => {
                const celda = fila.celdas.find((c) => c.idZona === zona.id);
                const isFirstZonaRow = zonaIndex === 0;

                return (
                  <TableRow
                    key={`${fila.idCategoria}-${zona.id}`}
                    className={cn(
                      "hover:bg-transparent",
                      isFirstZonaRow && "border-t-2 border-border-strong",
                    )}
                  >
                    {isFirstZonaRow ? (
                      <>
                        <TableCell
                          rowSpan={zonas.length}
                          className="align-top font-semibold text-foreground"
                        >
                          {fila.nombreCategoria}
                        </TableCell>
                        <TableCell rowSpan={zonas.length} className="align-top">
                          {formatCurrency(fila.valorHoraBasico)}
                        </TableCell>
                      </>
                    ) : null}
                    <TableCell>{zona.nombreZona}</TableCell>
                    <TableCell>
                      {celda ? (
                        formatCurrency(celda.valorHoraAdicional)
                      ) : (
                        <span className="italic text-foreground-muted">
                          Sin configurar
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {celda ? formatCurrency(celda.sumaNoRemunerativa) : "—"}
                    </TableCell>
                  </TableRow>
                );
              }),
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
