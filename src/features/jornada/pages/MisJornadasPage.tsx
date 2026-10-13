import { useState, type FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { Button, Card, CardContent, Input, Label } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";
import { MiJornadaCard } from "../components/MiJornadaCard";
import { useMisJornadas } from "../hooks/useMisJornadas";
import { fechaLocal } from "../utils/jornadaNavigation";
import { formatDate } from "../utils/planTrabajoFormatters";
import { esFechaValida, esPeriodoMisJornadas, periodosMisJornadas, rangoDelPeriodo } from "../utils/misJornadasPeriodos";

function FiltroRango({ desde, hasta, onAplicar }: { desde: string; hasta: string; onAplicar: (desde: string, hasta: string) => void }) {
  const [borradorDesde, setBorradorDesde] = useState(desde);
  const [borradorHasta, setBorradorHasta] = useState(hasta);
  const [error, setError] = useState<string | null>(null);

  const aplicar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!esFechaValida(borradorDesde) || !esFechaValida(borradorHasta)) {
      setError("Elegí ambas fechas para consultar el período.");
      return;
    }
    if (borradorDesde > borradorHasta) {
      setError("La fecha desde no puede ser posterior a la fecha hasta.");
      return;
    }
    setError(null);
    onAplicar(borradorDesde, borradorHasta);
  };

  return (
    <form onSubmit={aplicar} className="flex flex-wrap items-end gap-3">
      <div className="min-w-40 flex-1 sm:flex-none">
        <Label htmlFor="mis-jornadas-desde" className="mb-1.5 block">Desde</Label>
        <Input id="mis-jornadas-desde" type="date" value={borradorDesde} onChange={(event) => setBorradorDesde(event.target.value)} aria-invalid={Boolean(error)} required />
      </div>
      <div className="min-w-40 flex-1 sm:flex-none">
        <Label htmlFor="mis-jornadas-hasta" className="mb-1.5 block">Hasta</Label>
        <Input id="mis-jornadas-hasta" type="date" value={borradorHasta} onChange={(event) => setBorradorHasta(event.target.value)} aria-invalid={Boolean(error)} required />
      </div>
      <Button type="submit">Aplicar rango</Button>
      {error ? <p role="alert" className="w-full text-sm text-error">{error}</p> : null}
    </form>
  );
}

export default function MisJornadasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const hoy = fechaLocal();
  const periodoParam = searchParams.get("periodo");
  const periodo = esPeriodoMisJornadas(periodoParam) ? periodoParam : "semana";
  const rangoInicial = rangoDelPeriodo("semana", hoy, { fechaDesde: hoy, fechaHasta: hoy });
  const desdeParam = searchParams.get("desde") ?? "";
  const hastaParam = searchParams.get("hasta") ?? "";
  const rangoParamValido = esFechaValida(desdeParam) && esFechaValida(hastaParam) && desdeParam <= hastaParam;
  const fechaDesde = rangoParamValido ? desdeParam : rangoInicial.fechaDesde;
  const fechaHasta = rangoParamValido ? hastaParam : rangoInicial.fechaHasta;
  const rango = rangoDelPeriodo(periodo, hoy, { fechaDesde, fechaHasta });
  const consulta = useMisJornadas(rango);
  const volver = `${location.pathname}${location.search}`;

  const cambiarPeriodo = (nuevoPeriodo: typeof periodo) => {
    if (nuevoPeriodo === "rango") {
      setSearchParams({ periodo: "rango", desde: fechaDesde, hasta: fechaHasta });
    } else {
      setSearchParams({ periodo: nuevoPeriodo, desde: fechaDesde, hasta: fechaHasta });
    }
  };

  const jornadas = consulta.data?.jornadas ?? [];
  const destacada = consulta.data?.jornadaDestacada;
  const jornadasSinDuplicar = destacada
    ? jornadas.filter((jornada) => jornada.id !== destacada.id)
    : jornadas;

  return (
    <div className="space-y-6">
      <PageHeader title="Mis jornadas" description="Consultá tus jornadas laborales asignadas y tu situación de asistencia." />

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div role="group" aria-label="Período de Mis jornadas" className="flex flex-wrap gap-2">
            {periodosMisJornadas.map((opcion) => (
              <Button
                key={opcion.value}
                size="sm"
                variant={periodo === opcion.value ? "primary" : "outline"}
                aria-pressed={periodo === opcion.value}
                onClick={() => cambiarPeriodo(opcion.value)}
                className="normal-case tracking-normal"
              >
                {opcion.label}
              </Button>
            ))}
          </div>
          {periodo === "rango" ? (
            <FiltroRango key={`${fechaDesde}-${fechaHasta}`} desde={fechaDesde} hasta={fechaHasta} onAplicar={(desde, hasta) => setSearchParams({ periodo: "rango", desde, hasta })} />
          ) : null}
          <p className="flex items-center gap-2 text-sm text-foreground-muted">
            <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
            Del {formatDate(rango.fechaDesde)} al {formatDate(rango.fechaHasta)}
          </p>
        </CardContent>
      </Card>

      {consulta.isPending ? <Card><LoadingState label="Cargando tus jornadas…" /></Card> : null}
      {consulta.isError ? (
        <Card><ErrorState message={normalizeApiError(consulta.error, "No pudimos cargar tus jornadas.").message} onRetry={() => void consulta.refetch()} /></Card>
      ) : null}

      {!consulta.isError && consulta.data ? (
        <div className={cn("space-y-8", consulta.isFetching && "opacity-70")} aria-busy={consulta.isFetching}>
          {destacada ? (
            <section aria-labelledby="mi-jornada-destacada" className="space-y-3">
              <div>
                <h2 id="mi-jornada-destacada" className="text-base font-semibold text-foreground">
                  {destacada.fecha === hoy ? "Jornada de hoy" : "Tu próxima jornada"}
                </h2>
                <p className="mt-1 text-sm text-foreground-muted">Tu jornada actual o la próxima programada, independientemente del período seleccionado.</p>
              </div>
              <MiJornadaCard jornada={destacada} destacada volver={volver} />
            </section>
          ) : null}

          <section aria-labelledby="mis-jornadas-periodo" className="space-y-3">
            <div>
              <h2 id="mis-jornadas-periodo" className="text-base font-semibold text-foreground">Jornadas del período</h2>
              <p className="mt-1 text-sm text-foreground-muted">Incluye tus jornadas históricas de cualquier cuadrilla a la que hayas pertenecido.</p>
            </div>
            {jornadasSinDuplicar.length > 0 ? (
              <div className="space-y-3">
                {jornadasSinDuplicar.map((jornada) => <MiJornadaCard key={jornada.id} jornada={jornada} volver={volver} />)}
              </div>
            ) : (
              <Card><EmptyState
                title={jornadas.length > 0 ? "Tu jornada de este período está destacada arriba" : "No hay jornadas para este período"}
                description={jornadas.length > 0 ? "Podés abrir su detalle desde la tarjeta destacada." : (consulta.data.mensaje ?? "Probá seleccionando otro período.")}
              /></Card>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
