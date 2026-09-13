import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, Hash, MessageSquare, Tags, Paperclip, History, Briefcase, Eye, type LucideIcon } from "lucide-react";
import { PageHeader, ErrorState, LoadingState } from "@/shared/components";
import { Button, Card, CardContent, CardHeader, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui";
import { documentacionApi } from "@/features/documentacion/api/documentacionApi";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { formatFecha, formatFechaHora, formatHora, ESTADO_JORNADA_LABELS, TIPO_JORNADA_LABELS } from "@/features/asistencia/utils/asistenciaFormatters";
import { useMiSolicitudAusenciaDetalle } from "../hooks/useSolicitudesAusencia";
import { SolicitudAusenciaBadge } from "../components/SolicitudAusenciaBadge";
import { TipoSolicitudAusenciaDatos } from "../components/TipoSolicitudAusenciaDatos";
import { DocumentoVisorIntegrado } from "@/features/documentacion/components/DocumentoVisorIntegrado";
import type { DocumentoAusencia } from "../types/solicitudAusencia.types";

export default function MiSolicitudAusenciaDetailPage() {
  const { solicitudId } = useParams();
  const [params] = useSearchParams();
  const rawId = Number(solicitudId);
  const id = Number.isSafeInteger(rawId) && rawId > 0 ? rawId : null;
  const query = useMiSolicitudAusenciaDetalle(id);
  const [documento, setDocumento] = useState<DocumentoAusencia | null>(null);
  const solicitud = query.data;
  return <div className="space-y-6">
    <Button variant="ghost" size="sm" asChild><Link to={`/mis-ausencias${params.size ? `?${params}` : ""}`}><ArrowLeft />Volver a mis solicitudes</Link></Button>
    <PageHeader title="Detalle de solicitud de ausencia" description="Información registrada y seguimiento de la evaluación." />
    {id === null ? <ErrorState message="La solicitud indicada no es válida." /> : query.isPending ? <LoadingState label="Cargando solicitud…" />
      : query.isError ? <ErrorState message={normalizeApiError(query.error).message} onRetry={() => void query.refetch()} /> : solicitud && <>
        <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">{solicitud.tipoSolicitud.nombre}</h2><SolicitudAusenciaBadge estado={solicitud.estado} /></div></CardHeader>
          <CardContent className="space-y-5"><dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([["Fecha desde", formatFecha(solicitud.fechaDesde), CalendarDays], ["Fecha hasta", formatFecha(solicitud.fechaHasta), CalendarDays], ["Días solicitados", String(solicitud.cantidadDias), Hash], ["Fecha de creación", formatFechaHora(solicitud.fechaHoraSolicitud), Clock]] as [string, string, LucideIcon][]).map(([label, value, Icon]) => <div key={label}><dt className="flex items-center gap-2 text-xs text-foreground-muted"><Icon className="size-4 text-primary" aria-hidden="true" />{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}
          </dl><div><p className="flex items-center gap-2 text-xs text-foreground-muted"><MessageSquare className="size-4 text-primary" aria-hidden="true" />Motivo</p><p className="mt-1 whitespace-pre-wrap break-words text-sm">{solicitud.motivo}</p></div></CardContent>
        </Card>
        <Card><CardHeader><h2 className="flex items-center gap-2 text-base font-semibold"><Tags className="size-5 text-primary" aria-hidden="true" />Reglas del tipo utilizado</h2></CardHeader><CardContent><TipoSolicitudAusenciaDatos datos={solicitud.tipoSolicitud} /></CardContent></Card>
        <Card><CardHeader><h2 className="flex items-center gap-2 text-base font-semibold"><Paperclip className="size-5 text-primary" aria-hidden="true" />Documentación adjunta</h2></CardHeader><CardContent>
          {!solicitud.documentos.length ? <p className="text-sm text-foreground-muted">No se adjuntó documentación.</p> : <ul className="space-y-3">{solicitud.documentos.map((doc) => <li key={doc.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold">{doc.nombreArchivoOriginal || doc.nombre}</p><p className="text-xs text-foreground-muted">{formatFechaHora(doc.fechaSubida)}</p></div><Button variant="outline" size="sm" onClick={() => setDocumento(doc)}><Eye />Ver documento</Button></li>)}</ul>}
        </CardContent></Card>
        <Card><CardHeader><h2 className="flex items-center gap-2 text-base font-semibold"><Briefcase className="size-5 text-primary" aria-hidden="true" />Jornadas asociadas</h2></CardHeader><CardContent>
          {!solicitud.jornadas.length ? <p className="text-sm text-foreground-muted">No se detectaron jornadas asociadas al rango seleccionado.</p>
            : <ul className="grid gap-3 lg:grid-cols-2">{solicitud.jornadas.map((jornada) => <li key={jornada.id} className="rounded-lg border border-border p-4 text-sm space-y-2"><p className="font-semibold">{formatFecha(jornada.fecha)} · {formatHora(jornada.horaInicioPlanificada)} – {formatHora(jornada.horaFinPlanificada)}</p><p>{TIPO_JORNADA_LABELS[jornada.tipoJornada]} · {ESTADO_JORNADA_LABELS[jornada.estado]}</p><p className="break-words text-foreground-muted">Obra: {jornada.obra || "Sin obra"} · Cuadrilla: {jornada.cuadrilla || "Sin cuadrilla"}</p></li>)}</ul>}
        </CardContent></Card>
        <Card><CardHeader><h2 className="flex items-center gap-2 text-base font-semibold"><History className="size-5 text-primary" aria-hidden="true" />Historial de estados</h2></CardHeader><CardContent>
          <ol className="space-y-4">{solicitud.historialEstados.map((item, index) => <li key={index} className="border-l-2 border-border pl-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2"><SolicitudAusenciaBadge estado={item.estado} />{!item.fechaHoraHasta && <span className="text-xs text-foreground-muted">Estado vigente</span>}</div>
            <p className="text-xs text-foreground-muted">{formatFechaHora(item.fechaHoraDesde)}{item.fechaHoraHasta ? ` · Hasta ${formatFechaHora(item.fechaHoraHasta)}` : ""}</p>
            {item.motivo && <p className="whitespace-pre-wrap break-words text-sm"><span className="font-semibold">Motivo: </span>{item.motivo}</p>}
          </li>)}</ol>
        </CardContent></Card>
      </>}
    {documento && <DocumentoVisor key={documento.id} documento={documento} onClose={() => setDocumento(null)} />}
  </div>;
}
function DocumentoVisor({ documento, onClose }: { documento: DocumentoAusencia; onClose: () => void }) {
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let activo = true;
    documentacionApi.obtenerUrlVisor(documento.id).then((value) => { if (activo) setUrl(value); }).catch((error) => { if (activo) setError(normalizeApiError(error).message); }).finally(() => { if (activo) setLoading(false); });
    return () => { activo = false; };
  }, [documento.id]);
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
    <DialogHeader><DialogTitle className="flex items-start gap-2 break-words"><Paperclip className="size-5 shrink-0 text-primary" aria-hidden="true" />{documento.nombreArchivoOriginal || documento.nombre}</DialogTitle><DialogDescription>Documentación de tu solicitud de ausencia.</DialogDescription></DialogHeader>
    {loading ? <LoadingState label="Cargando documento…" /> : error ? <ErrorState message={error} /> : url && <DocumentoVisorIntegrado url={url} titulo={documento.nombreArchivoOriginal || documento.nombre} contentType={documento.contentType} onClose={onClose} />}
  </DialogContent></Dialog>;
}

