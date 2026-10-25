import { useEffect, useMemo, useRef, useState } from "react";
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
import { opcionesScrollFiltros } from "../utils/scrollReporte";

function filtrosIniciales(): ReporteFiltros {
  return { fechaDesde: inicioDeMesIso(), fechaHasta: hoyIso(), fechaCorte: hoyIso() };
}

// Se lee en el momento del desplazamiento; no hace falta re-renderizar si cambia.
function prefiereMenosMovimiento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  const filtrosCardRef = useRef<HTMLDivElement>(null);
  const filtrosTituloRef = useRef<HTMLHeadingElement>(null);
  // Cuenta cada selección (también la del mismo reporte) para volver a llevar a la card.
  const [selecciones, setSelecciones] = useState(0);

  const seleccionar = (tipo: TipoReporte) => {
    setCodigo(tipo);
    setFiltros(filtrosIniciales());
    setFiltrosAplicados(undefined);
    setSelecciones((n) => n + 1);
  };

  // La card de filtros se agrega debajo de la grilla y suele quedar fuera de vista: se
  // lleva hasta ella y el foco pasa a su título, para teclado y lector de pantalla.
  useEffect(() => {
    if (selecciones === 0) return;
    filtrosTituloRef.current?.focus({ preventScroll: true });
    filtrosCardRef.current?.scrollIntoView(opcionesScrollFiltros(prefiereMenosMovimiento()));
  }, [selecciones]);

  // El resultado se agrega debajo de la card de filtros y también puede quedar fuera de
  // vista. Solo se lleva hasta él cuando llega uno nuevo: React Query conserva la misma
  // referencia si al regenerar los datos no cambian. El foco queda en "Generar".
  const resultadoRef = useRef<HTMLDivElement>(null);
  const resultado = reporteQuery.data;
  useEffect(() => {
    if (!resultado) return;
    resultadoRef.current?.scrollIntoView(opcionesScrollFiltros(prefiereMenosMovimiento()));
  }, [resultado]);

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
        // scroll-mb-24: al alinearse abajo, que no la tape el botón flotante de Tracky.
        <div ref={filtrosCardRef} className="scroll-mb-24">
          <Card>
            <CardContent className="space-y-4 p-4 sm:p-5">
              <div>
                <h2
                  ref={filtrosTituloRef}
                  tabIndex={-1}
                  className="text-lg font-semibold text-foreground focus:outline-none"
                >
                  {seleccionado.titulo}
                </h2>
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
        </div>
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
          // Si es más alto que la pantalla, "nearest" lo alinea arriba; scroll-mt-4 deja aire.
          <div ref={resultadoRef} className="scroll-mt-4 scroll-mb-24">
            <ResultadoReporte reporte={reporteQuery.data} />
          </div>
        ) : null
      ) : null}
    </div>
  );
}

export default ReportesPage;
