import { EmptyState } from "@/shared/components";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { ReporteResponseDto } from "../types/reporte.types";
import { esNumerico, formatearEnum, formatearValor } from "../utils/formatoReporte";

export function ResultadoReporte({ reporte }: { reporte: ReporteResponseDto }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-foreground-muted">
        Generado el {formatearValor(reporte.fechaGeneracion, "FECHA_HORA")}
        {reporte.filtrosAplicados.length > 0 ? ` · ${reporte.filtrosAplicados.join(" · ")}` : null}
      </p>

      {reporte.resumen.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {reporte.resumen.map((indicador) => (
            <Card key={indicador.etiqueta} className="shadow-soft">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  {/^[A-Z_]+$/.test(indicador.etiqueta)
                    ? formatearEnum(indicador.etiqueta)
                    : indicador.etiqueta}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatearValor(indicador.valor, indicador.tipoDato)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
        {reporte.filas.length === 0 ? (
          <EmptyState
            title="Sin datos"
            description="No hay resultados para los filtros seleccionados."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {reporte.columnas.map((columna) => (
                    <TableHead
                      key={columna.clave}
                      className={cn("whitespace-nowrap", esNumerico(columna.tipoDato) && "text-right")}
                    >
                      {columna.titulo}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reporte.filas.map((fila, indice) => (
                  <TableRow key={indice}>
                    {reporte.columnas.map((columna) => (
                      <TableCell
                        key={columna.clave}
                        className={cn(esNumerico(columna.tipoDato) && "text-right tabular-nums")}
                      >
                        {formatearValor(fila[columna.clave], columna.tipoDato)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <p className="text-xs text-foreground-muted">{reporte.filas.length} filas</p>
    </div>
  );
}
