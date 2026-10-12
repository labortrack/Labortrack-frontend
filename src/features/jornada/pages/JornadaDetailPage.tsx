import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Ban, Building2, CalendarCheck2, CalendarDays, Clock3, ClipboardList, MessageSquare, UserRound, Users, Zap, type LucideIcon } from "lucide-react";
import { BackLink, ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { Card, CardContent } from "@/shared/ui";
import { useJornadaDetalle } from "../hooks/useJornadas";
import { JornadaStatusBadge } from "../components/JornadaStatusBadge";
import { AsistenciasJornada } from "../components/AsistenciasJornada";
import { decisionLabels, formatDate, formatDateTime, formatTime, tipoJornadaLabels } from "../utils/planTrabajoFormatters";
import { rutaRetornoJornada } from "../utils/jornadaNavigation";

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="flex min-w-0 items-start gap-2.5"><Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /><div className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-foreground">{value}</dd></div></div>;
}

export default function JornadaDetailPage() {
  const { jornadaId } = useParams();
  const [searchParams] = useSearchParams();
  const id = Number(jornadaId);
  const valid = Number.isInteger(id) && id > 0;
  const backTo = rutaRetornoJornada(searchParams.get("volver"));
  const query = useJornadaDetalle(id);

  if (!valid) return <Navigate to="/jornadas" replace />;
  if (query.isPending) return <Card><LoadingState label="Cargando detalle de jornada…" /></Card>;
  if (query.isError || !query.data) return <div className="space-y-4"><BackLink to={backTo} /><Card><ErrorState message="No se pudo consultar esta jornada o no está dentro de tu alcance." onRetry={() => void query.refetch()} /></Card></div>;

  const jornada = query.data;
  return (
    <div className="space-y-6">
      <div className="space-y-3"><BackLink to={backTo} label="Volver a jornadas" /><div className="flex flex-wrap items-center gap-3"><PageHeader title={`Jornada del ${formatDate(jornada.fecha)}`} description={`${jornada.cuadrillaNombre} · ${jornada.obraNombre}`} /><JornadaStatusBadge estado={jornada.estado} /></div></div>
      <Card><dl className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Info icon={Building2} label="Obra" value={jornada.obraNombre} />
        <Info icon={Users} label="Cuadrilla" value={jornada.cuadrillaNombre} />
        <Info icon={ClipboardList} label="Plan de origen" value={`Plan de trabajo #${jornada.planTrabajoId}`} />
        <Info icon={CalendarDays} label="Fecha" value={formatDate(jornada.fecha)} />
        <Info icon={Clock3} label="Horario planificado" value={`${formatTime(jornada.horaInicioPlanificada)} a ${formatTime(jornada.horaFinPlanificada)}`} />
        <Info icon={CalendarCheck2} label="Tipo de jornada" value={tipoJornadaLabels[jornada.tipo]} />
        <Info icon={Zap} label="Condición" value={jornada.extraordinaria ? "Extraordinaria" : "Ordinaria"} />
        {jornada.tipo === "NO_LABORABLE" ? <Info icon={CalendarCheck2} label="Decisión de día no laborable" value={decisionLabels[jornada.decisionDiaNoLaborable]} /> : null}
      </dl></Card>

      {jornada.estado === "ANULADA" && jornada.anulacion ? <Card><CardContent className="space-y-4 p-5"><h2 className="flex items-center gap-2 font-semibold text-foreground"><Ban className="size-5 text-error" aria-hidden="true" />Anulación de la jornada</h2><dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Info icon={MessageSquare} label="Motivo" value={jornada.anulacion.motivo || "—"} /><Info icon={UserRound} label="Responsable" value={jornada.anulacion.usuarioResponsable || "Sin responsable registrado"} /><Info icon={Clock3} label="Fecha y hora" value={formatDateTime(jornada.anulacion.fechaHora)} /><Info icon={Users} label="Asistencias anuladas" value={String(jornada.anulacion.totalAsistenciasAfectadas)} /></dl></CardContent></Card> : null}

      <AsistenciasJornada jornada={jornada} />
    </div>
  );
}
