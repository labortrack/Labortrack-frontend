import { useDeferredValue, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { RotateCcw, Users } from "lucide-react";
import { ListadoParteDiario } from "@/features/asistencia/components/ListadoParteDiario";
import { ResumenParteDiario } from "@/features/asistencia/components/ResumenParteDiario";
import { useCapacidadesAsistencia, useParteDiarioAsistencia } from "@/features/asistencia/hooks/useAsistencias";
import type { EstadoAsistencia } from "@/features/asistencia/types/asistencia.types";
import { ESTADO_ASISTENCIA_LABELS } from "@/features/asistencia/utils/asistenciaFormatters";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { EmptyState, ErrorState, LoadingState, SearchInput } from "@/shared/components";
import { Button, Card, CardContent, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Spinner } from "@/shared/ui";
import type { JornadaDetalle } from "../types/jornada.types";
import { formatDate } from "../utils/planTrabajoFormatters";

const TODOS = "TODOS";
const estados = Object.keys(ESTADO_ASISTENCIA_LABELS) as EstadoAsistencia[];

export function AsistenciasJornada({ jornada }: { jornada: JornadaDetalle }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const estadoParam = searchParams.get("asistenciaEstado");
  const estado = estados.includes(estadoParam as EstadoAsistencia) ? estadoParam as EstadoAsistencia : undefined;
  const trabajador = searchParams.get("asistenciaTrabajador") ?? "";
  const trabajadorDiferido = useDeferredValue(trabajador.trim());
  const capacidades = useCapacidadesAsistencia();
  const puedeConsultar = jornada.puedeConsultarParteDiario && capacidades.data?.parteDiario?.puedeConsultar === true;
  const filtros = useMemo(() => ({
    fecha: jornada.fecha,
    obraId: jornada.obraId,
    cuadrillaId: jornada.cuadrillaId,
    jornadaId: jornada.id,
    ...(estado ? { estado } : {}),
    ...(trabajadorDiferido ? { trabajador: trabajadorDiferido } : {}),
  }), [jornada.fecha, jornada.obraId, jornada.cuadrillaId, jornada.id, estado, trabajadorDiferido]);
  const parte = useParteDiarioAsistencia(filtros, puedeConsultar && jornada.resumenAsistencias.totalEsperadas > 0);
  const filtrosActivos = Boolean(estado || trabajador);

  const actualizarFiltro = (clave: string, valor: string) => {
    setSearchParams((actual) => {
      const siguiente = new URLSearchParams(actual);
      if (valor && valor !== TODOS) siguiente.set(clave, valor);
      else siguiente.delete(clave);
      return siguiente;
    }, { replace: true });
  };

  const limpiarFiltros = () => {
    setSearchParams((actual) => {
      const siguiente = new URLSearchParams(actual);
      siguiente.delete("asistenciaEstado");
      siguiente.delete("asistenciaTrabajador");
      return siguiente;
    }, { replace: true });
  };

  const detallePath = (asistenciaId: number) => {
    const volver = `${location.pathname}${location.search}`;
    return `/asistencias/${asistenciaId}?${new URLSearchParams({ volver })}`;
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold"><Users className="size-5 text-primary" aria-hidden="true" />Asistencias asociadas</h2>
          <p className="mt-1 text-sm text-foreground-muted">{jornada.resumenAsistencias.totalEsperadas} asistencia{jornada.resumenAsistencias.totalEsperadas === 1 ? "" : "s"} registrada{jornada.resumenAsistencias.totalEsperadas === 1 ? "" : "s"} para esta jornada.</p>
        </div>

        <ResumenParteDiario resumen={jornada.resumenAsistencias} />

        {jornada.resumenAsistencias.totalEsperadas === 0 ? (
          <EmptyState title="Sin asistencias generadas" description="Las asistencias aparecerán cuando se generen para esta jornada." />
        ) : capacidades.isPending ? (
          <LoadingState label="Verificando acceso a las asistencias…" />
        ) : capacidades.isError ? (
          <ErrorState message="No se pudo verificar el acceso a las asistencias." onRetry={() => void capacidades.refetch()} />
        ) : !puedeConsultar ? (
          <p className="border-t border-border pt-5 text-sm text-foreground-muted">No tenés permiso para consultar el detalle de estas asistencias.</p>
        ) : (
          <div className="space-y-5 border-t border-border pt-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Filtrar asistencias</h3>
                <p className="mt-1 text-xs text-foreground-muted">Jornada del {formatDate(jornada.fecha)} · {jornada.cuadrillaNombre}. El resumen anterior corresponde a toda la jornada.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={limpiarFiltros} disabled={!filtrosActivos}><RotateCcw className="size-4" />Limpiar filtros</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="estado-asistencias-jornada" className="mb-1.5 block">Estado</Label>
                <Select value={estado ?? TODOS} onValueChange={(valor) => actualizarFiltro("asistenciaEstado", valor)}>
                  <SelectTrigger id="estado-asistencias-jornada"><SelectValue placeholder="Todos los estados" /></SelectTrigger>
                  <SelectContent><SelectItem value={TODOS}>Todos los estados</SelectItem>{estados.map((valor) => <SelectItem key={valor} value={valor}>{ESTADO_ASISTENCIA_LABELS[valor]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="trabajador-asistencias-jornada" className="mb-1.5 block">Trabajador</Label>
                <SearchInput id="trabajador-asistencias-jornada" value={trabajador} placeholder="Nombre o apellido" onChange={(event) => actualizarFiltro("asistenciaTrabajador", event.target.value)} />
              </div>
            </div>
            {parte.isPending ? (
              <LoadingState label="Cargando las asistencias de esta jornada…" />
            ) : parte.isError ? (
              <ErrorState message={normalizeApiError(parte.error, "No se pudieron consultar las asistencias de esta jornada.").message} onRetry={() => void parte.refetch()} />
            ) : parte.data ? (
              <div className="relative" aria-busy={parte.isFetching}>
                {parte.isFetching ? <span className="absolute right-0 top-0 z-10 flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 text-xs text-foreground-muted shadow-soft" role="status"><Spinner className="size-3.5 text-primary" />Actualizando asistencias…</span> : null}
                {parte.data.asistencias.length > 0 ? (
                  <ListadoParteDiario asistencias={parte.data.asistencias} fechaLabel={formatDate(jornada.fecha)} detallePath={detallePath} ocultarContexto />
                ) : (
                  <EmptyState
                    title={filtrosActivos ? "No hay asistencias para estos filtros" : "No hay asistencias disponibles"}
                    description={filtrosActivos ? "Probá quitando algún filtro para ampliar los resultados." : "No se encontraron asistencias consultables para esta jornada."}
                    action={filtrosActivos ? <Button variant="outline" size="sm" onClick={limpiarFiltros}>Limpiar filtros</Button> : undefined}
                  />
                )}
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
