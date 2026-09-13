import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, FileClock, Pencil, Power } from "lucide-react";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { Alert, Button, Card, CardContent, CardHeader } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useTipoSolicitudAusenciaDetalle } from "../hooks/useTiposSolicitudAusencia";
import { TipoSolicitudAusenciaBadge, TipoSolicitudAusenciaDatos } from "../components/TipoSolicitudAusenciaDatos";
import { formatFechaHoraTipoAusencia } from "../utils/tipoSolicitudAusenciaFormatters";
import { DesactivarTipoSolicitudAusenciaDialog, TipoSolicitudAusenciaFormDialog } from "../components/TipoSolicitudAusenciaDialogs";

export default function TipoSolicitudAusenciaDetailPage() {
  const { tipoId } = useParams();
  const location = useLocation();
  const id = Number(tipoId);
  const idValido = Number.isSafeInteger(id) && id > 0;
  const query = useTipoSolicitudAusenciaDetalle(idValido ? id : null);
  const [dialogo, setDialogo] = useState<"modificar" | "desactivar">();
  const volver = `/ausencias/tipos-solicitud${location.search}`;
  const back = <Button variant="ghost" asChild><Link to={volver}><ArrowLeft />Volver a tipos de solicitud</Link></Button>;

  if (!idValido) return <div className="space-y-4">{back}<Card><EmptyState title="El tipo de solicitud indicado no es válido." /></Card></div>;
  if (query.isPending) return <div className="space-y-4">{back}<Card><LoadingState label="Cargando el tipo de solicitud…" /></Card></div>;
  if (query.isError || !query.data) return <div className="space-y-4">{back}<Card><ErrorState message={normalizeApiError(query.error, "No se pudo obtener el tipo de solicitud.").message} onRetry={() => void query.refetch()} /></Card></div>;

  const tipo = query.data;
  const puedeModificar = tipo.estado === "ACTIVO" && tipo.accionesDisponibles.includes("MODIFICAR");
  const puedeDesactivar = tipo.estado === "ACTIVO" && tipo.accionesDisponibles.includes("DESACTIVAR");

  return <div className="space-y-6">
    <div>{back}<div className="mt-3"><PageHeader title={tipo.nombre} description="Consultá las reglas vigentes y las versiones anteriores de este tipo de solicitud."
      actions={<TipoSolicitudAusenciaBadge estado={tipo.estado} />} /></div></div>
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardHeader><h2 className="text-base font-semibold">Datos vigentes</h2></CardHeader>
      <CardContent><TipoSolicitudAusenciaDatos datos={tipo} />
        <dl className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
          <div><dt className="text-xs text-foreground-muted">Inicio de vigencia de la versión actual</dt><dd className="mt-1 text-sm font-semibold">{formatFechaHoraTipoAusencia(tipo.fechaHoraDesdeVigencia)}</dd></div>
          <div><dt className="text-xs text-foreground-muted">Fecha de baja</dt><dd className="mt-1 text-sm font-semibold">{tipo.fechaBaja ? formatFechaHoraTipoAusencia(tipo.fechaBaja) : "No aplica"}</dd></div>
        </dl>
      </CardContent>
    </Card>
    <section aria-labelledby="versiones-tipo-ausencia" className="space-y-3">
      <div><h2 id="versiones-tipo-ausencia" className="text-base font-semibold">Versiones anteriores</h2><p className="mt-1 text-sm text-foreground-muted">Las solicitudes históricas conservan las reglas de la versión utilizada al registrarse.</p></div>
      {tipo.versionesAnteriores.length === 0 ? <Card><CardContent className="p-5 text-sm text-foreground-muted">Este tipo de solicitud no tiene versiones anteriores.</CardContent></Card>
        : tipo.versionesAnteriores.map((version) => <Card key={version.fechaHoraDesdeVigencia} className="overflow-hidden">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-5 focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"><FileClock className="size-5 text-foreground-muted" /></span>
              <div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{version.nombre}</p><p className="mt-1 text-xs text-foreground-muted">Vigencia: {formatFechaHoraTipoAusencia(version.fechaHoraDesdeVigencia)} al {formatFechaHoraTipoAusencia(version.fechaHoraHastaVigencia)}</p></div>
              <ChevronDown className="size-5 shrink-0 text-foreground-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-border p-5"><TipoSolicitudAusenciaDatos datos={version} /></div>
          </details>
        </Card>)}
    </section>
    {tipo.estado === "INACTIVO" && <Alert variant="info">Este tipo está inactivo y no está disponible para nuevas solicitudes.</Alert>}
    {(puedeModificar || puedeDesactivar) && <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
      {puedeModificar && <Button variant="outline" onClick={() => setDialogo("modificar")}><Pencil />Modificar</Button>}
      {puedeDesactivar && <Button variant="destructive" onClick={() => setDialogo("desactivar")}><Power />Desactivar</Button>}
    </div>}
    {dialogo === "modificar" && <TipoSolicitudAusenciaFormDialog tipo={tipo} onClose={() => setDialogo(undefined)} />}
    {dialogo === "desactivar" && <DesactivarTipoSolicitudAusenciaDialog tipo={tipo} onClose={() => setDialogo(undefined)} />}
  </div>;
}
