import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock3, Users } from "lucide-react";
import { BackLink, EmptyState, ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { Button, Card, CardContent } from "@/shared/ui";
import { useCapacidadesAsistencia } from "@/features/asistencia/hooks/useAsistencias";
import { useJornadaDetalle } from "../hooks/useJornadas";
import { JornadaStatusBadge } from "../components/JornadaStatusBadge";
import { decisionLabels, formatDate, formatDateTime, formatTime, tipoJornadaLabels } from "../utils/planTrabajoFormatters";
import { rutaRetornoJornada } from "../utils/jornadaNavigation";

function Info({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-foreground">{value}</dd></div>;
}

export default function JornadaDetailPage() {
  const { jornadaId } = useParams();
  const [searchParams] = useSearchParams();
  const id = Number(jornadaId);
  const valid = Number.isInteger(id) && id > 0;
  const backTo = rutaRetornoJornada(searchParams.get("volver"));
  const query = useJornadaDetalle(id);
  const capacidades = useCapacidadesAsistencia();

  if (!valid) return <Navigate to="/jornadas" replace />;
  if (query.isPending) return <Card><LoadingState label="Cargando detalle de jornada…" /></Card>;
  if (query.isError || !query.data) return <div className="space-y-4"><BackLink to={backTo} /><Card><ErrorState message="No se pudo consultar esta jornada o no está dentro de tu alcance." onRetry={() => void query.refetch()} /></Card></div>;

  const jornada = query.data;
  const resumen = jornada.resumenAsistencias;
  const puedeAbrirParte = jornada.puedeConsultarParteDiario && capacidades.data?.parteDiario?.puedeConsultar && jornada.estado !== "ANULADA" && resumen.totalEsperadas > 0;
  const parteParams = new URLSearchParams({ fecha: jornada.fecha, obraId: String(jornada.obraId), cuadrillaId: String(jornada.cuadrillaId), jornadaId: String(jornada.id) });
  const metricas = [
    ["Pendientes de ingreso", resumen.pendientesIngreso],
    ["Presentes", resumen.presentes],
    ["Egresadas", resumen.egresadas],
    ["Ausentes", resumen.ausentes],
    ["Ausencias justificadas", resumen.ausenciasJustificadas],
    ["No trabajadas computables", resumen.noTrabajadasComputables],
    ["Anuladas", resumen.anuladas],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="space-y-3"><BackLink to={backTo} label="Volver a jornadas" /><div className="flex flex-wrap items-center gap-3"><PageHeader title={`Jornada del ${formatDate(jornada.fecha)}`} description={`${jornada.cuadrillaNombre} · ${jornada.obraNombre}`} /><JornadaStatusBadge estado={jornada.estado} /></div></div>
      <Card><dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Info label="Obra" value={jornada.obraNombre} />
        <Info label="Cuadrilla" value={jornada.cuadrillaNombre} />
        <Info label="Plan de origen" value={`Plan de trabajo #${jornada.planTrabajoId}`} />
        <Info label="Fecha" value={formatDate(jornada.fecha)} />
        <Info label="Horario planificado" value={`${formatTime(jornada.horaInicioPlanificada)} a ${formatTime(jornada.horaFinPlanificada)}`} />
        <Info label="Tipo de jornada" value={tipoJornadaLabels[jornada.tipo]} />
        <Info label="Condición" value={jornada.extraordinaria ? "Extraordinaria" : "Ordinaria"} />
        {jornada.tipo === "NO_LABORABLE" ? <Info label="Decisión de día no laborable" value={decisionLabels[jornada.decisionDiaNoLaborable]} /> : null}
      </dl></Card>

      {jornada.estado === "ANULADA" && jornada.anulacion ? <Card><CardContent className="space-y-4 p-5"><h2 className="font-semibold text-foreground">Anulación de la jornada</h2><dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Info label="Motivo" value={jornada.anulacion.motivo || "—"} /><Info label="Responsable" value={jornada.anulacion.usuarioResponsable || "Sin responsable registrado"} /><Info label="Fecha y hora" value={formatDateTime(jornada.anulacion.fechaHora)} /><Info label="Asistencias anuladas" value={String(jornada.anulacion.totalAsistenciasAfectadas)} /></dl></CardContent></Card> : null}

      <Card><CardContent className="space-y-5 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold"><Users className="size-5 text-primary" />Asistencias asociadas</h2><p className="mt-1 text-sm text-foreground-muted">{resumen.totalEsperadas} asistencia{resumen.totalEsperadas === 1 ? "" : "s"} registrada{resumen.totalEsperadas === 1 ? "" : "s"} para esta jornada.</p></div>{puedeAbrirParte ? <Button asChild variant="outline"><Link to={`/asistencias?${parteParams.toString()}`}>Ver parte diario de esta jornada</Link></Button> : null}</div>{resumen.totalEsperadas === 0 ? <EmptyState title="Sin asistencias generadas" description="Las asistencias aparecerán cuando se generen para esta jornada." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metricas.map(([label, count]) => <div key={label} className="rounded-lg border border-border bg-muted/20 p-4"><div className="text-2xl font-semibold text-foreground">{count}</div><div className="mt-1 text-xs text-foreground-muted">{label}</div></div>)}</div>}</CardContent></Card>
      <div className="flex flex-wrap gap-2 text-xs text-foreground-muted"><span className="inline-flex items-center gap-1"><CalendarDays className="size-4" />{formatDate(jornada.fecha)}</span><span className="inline-flex items-center gap-1"><Clock3 className="size-4" />{formatTime(jornada.horaInicioPlanificada)}–{formatTime(jornada.horaFinPlanificada)}</span></div>
    </div>
  );
}
