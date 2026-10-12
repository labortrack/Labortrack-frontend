import { useMemo, useState } from "react";
import { FileSpreadsheet, FileText, Play } from "lucide-react";
import { toast } from "sonner";
import { ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { Button, Card, CardContent } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";
import { FiltrosReporte } from "../components/FiltrosReporte";
import { ResultadoReporte } from "../components/ResultadoReporte";
import { useExportarReporte, useReporte, useTiposReporte } from "../hooks/useReportes";
import type {
  FormatoExportacion,
  ReporteFiltros,
  TipoReporte,
  TipoReporteResponseDto,
} from "../types/reporte.types";
import { hoyIso, inicioDeMesIso } from "../utils/formatoReporte";

function filtrosIniciales(): ReporteFiltros {
  return { fechaDesde: inicioDeMesIso(), fechaHasta: hoyIso(), fechaCorte: hoyIso() };
}

function agruparPorCategoria(tipos: TipoReporteResponseDto[]) {
  const grupos = new Map<string, TipoReporteResponseDto[]>();
  for (const tipo of tipos) {
    grupos.set(tipo.categoria, [...(grupos.get(tipo.categoria) ?? []), tipo]);
  }
  return [...grupos.entries()];
}

export function ReportesPage() {
  const tiposQuery = useTiposReporte();
  const [codigo, setCodigo] = useState<TipoReporte>();
  const [filtros, setFiltros] = useState<ReporteFiltros>(filtrosIniciales);
  const [filtrosAplicados, setFiltrosAplicados] = useState<ReporteFiltros>();
  const reporteQuery = useReporte(codigo, filtrosAplicados);
  const exportar = useExportarReporte();

  const grupos = useMemo(() => agruparPorCategoria(tiposQuery.data ?? []), [tiposQuery.data]);
  const seleccionado = tiposQuery.data?.find((tipo) => tipo.codigo === codigo);

  const seleccionar = (tipo: TipoReporte) => {
    setCodigo(tipo);
    setFiltros(filtrosIniciales());
    setFiltrosAplicados(undefined);
  };

  const descargar = (formato: FormatoExportacion) => {
    if (!codigo) return;
    exportar.mutate(
      { tipo: codigo, filtros, formato },
      {
        onError: (error) =>
          toast.error(normalizeApiError(error, "No se pudo exportar el reporte.").message),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Generá reportes de cada módulo, consultalos en pantalla y exportalos a PDF o Excel."
      />

      {tiposQuery.isLoading ? (
        <LoadingState label="Cargando reportes..." />
      ) : tiposQuery.isError ? (
        <ErrorState
          message={normalizeApiError(tiposQuery.error, "No se pudieron cargar los reportes.").message}
          onRetry={() => tiposQuery.refetch()}
        />
      ) : (
        <div className="space-y-5">
          {grupos.map(([categoria, tiposCategoria]) => (
            <section key={categoria}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                {categoria}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {tiposCategoria.map((tipo) => (
                  <button
                    key={tipo.codigo}
                    type="button"
                    onClick={() => seleccionar(tipo.codigo)}
                    aria-pressed={tipo.codigo === codigo}
                    className={cn(
                      "rounded-card border bg-card p-4 text-left shadow-soft transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                      tipo.codigo === codigo ? "border-primary ring-1 ring-primary" : "border-border",
                    )}
                  >
                    <p className="font-semibold text-foreground">{tipo.titulo}</p>
                    <p className="mt-1 text-sm text-foreground-muted">{tipo.descripcion}</p>
                    <p className="mt-2 text-xs text-foreground-muted">
                      Exporta a {tipo.formatos.map((f) => (f === "EXCEL" ? "Excel" : f)).join(" y ")}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {seleccionado ? (
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{seleccionado.titulo}</h2>
              <p className="text-sm text-foreground-muted">{seleccionado.descripcion}</p>
            </div>
            {seleccionado.filtros.length > 0 ? (
              <FiltrosReporte tipo={seleccionado} filtros={filtros} onChange={setFiltros} />
            ) : null}
            <div className="flex flex-wrap gap-2.5">
              <Button onClick={() => setFiltrosAplicados({ ...filtros })}>
                <Play />
                Generar
              </Button>
              {seleccionado.formatos.includes("PDF") ? (
                <Button variant="outline" disabled={exportar.isPending} onClick={() => descargar("PDF")}>
                  <FileText />
                  Exportar PDF
                </Button>
              ) : null}
              {seleccionado.formatos.includes("EXCEL") ? (
                <Button variant="outline" disabled={exportar.isPending} onClick={() => descargar("EXCEL")}>
                  <FileSpreadsheet />
                  Exportar Excel
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {seleccionado && filtrosAplicados ? (
        reporteQuery.isLoading ? (
          <LoadingState label="Generando reporte..." />
        ) : reporteQuery.isError ? (
          <ErrorState
            message={normalizeApiError(reporteQuery.error, "No se pudo generar el reporte.").message}
            onRetry={() => reporteQuery.refetch()}
          />
        ) : reporteQuery.data ? (
          <ResultadoReporte reporte={reporteQuery.data} />
        ) : null
      ) : null}
    </div>
  );
}

export default ReportesPage;
