import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Building2, CalendarDays, CalendarOff, Clock3, Users, Zap, type LucideIcon } from "lucide-react";
import { AsistenciaStatusBadge } from "@/features/asistencia/components/AsistenciaStatusBadge";
import { RegistroAsistenciaCard } from "@/features/asistencia/components/RegistroAsistenciaCard";
import { BackLink, ErrorState, LoadingState, PageHeader } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { Card, CardContent } from "@/shared/ui";
import { JornadaStatusBadge } from "../components/JornadaStatusBadge";
import { useMiJornadaDetalle } from "../hooks/useMisJornadas";
import { formatDate, formatTime, tipoJornadaLabels } from "../utils/planTrabajoFormatters";

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-foreground">{value}</dd>
      </div>
    </div>
  );
}

export default function MiJornadaDetailPage() {
  const { jornadaId } = useParams();
  const [searchParams] = useSearchParams();
  const id = Number(jornadaId);
  const valido = Number.isInteger(id) && id > 0;
  const volverParam = searchParams.get("volver");
  const volver = volverParam && /^\/mis-jornadas(?:\?|$)/.test(volverParam) ? volverParam : "/mis-jornadas";
  const consulta = useMiJornadaDetalle(id);

  if (!valido) return <Navigate to="/mis-jornadas" replace />;
  if (consulta.isPending) return <Card><LoadingState label="Cargando el detalle de tu jornada…" /></Card>;
  if (consulta.isError || !consulta.data) {
    return (
      <div className="space-y-4">
        <BackLink to={volver} label="Volver a Mis jornadas" />
        <Card><ErrorState message={normalizeApiError(consulta.error, "No pudimos consultar esta jornada. Verificá que pertenezca a tus asignaciones.").message} onRetry={() => void consulta.refetch()} /></Card>
      </div>
    );
  }

  const jornada = consulta.data;
  const sinTrabajo = jornada.noRequiereAsistencia || jornada.estado === "NO_TRABAJADA";

  return (
    <div className="space-y-6">
      <div>
        <BackLink to={volver} label="Volver a Mis jornadas" />
        <PageHeader title="Detalle de mi jornada" description={`${formatDate(jornada.fecha)} · ${jornada.cuadrillaNombre} · ${jornada.obraNombre}`} />
      </div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-primary" />
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <JornadaStatusBadge estado={jornada.estado} />
            {!sinTrabajo && jornada.estadoAsistencia ? <AsistenciaStatusBadge estado={jornada.estadoAsistencia} /> : null}
            {jornada.extraordinaria ? <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground-muted"><Zap className="size-4" aria-hidden="true" />Extraordinaria</span> : null}
          </div>
          <dl className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-3">
            <Info icon={CalendarDays} label="Fecha" value={formatDate(jornada.fecha)} />
            <Info icon={Building2} label="Obra" value={jornada.obraNombre} />
            <Info icon={Users} label="Cuadrilla" value={jornada.cuadrillaNombre} />
            <Info icon={Clock3} label="Horario planificado" value={`${formatTime(jornada.horaInicioPlanificada)} a ${formatTime(jornada.horaFinPlanificada)}`} />
            <Info icon={CalendarDays} label="Tipo de jornada" value={tipoJornadaLabels[jornada.tipo]} />
            <Info icon={Clock3} label="Condición" value={jornada.extraordinaria ? "Extraordinaria" : "Ordinaria"} />
          </dl>
        </CardContent>
      </Card>

      {sinTrabajo ? (
        <Card><CardContent className="flex flex-col items-center gap-2 p-6 text-center sm:p-8">
          <CalendarOff className="size-7 text-warning" aria-hidden="true" />
          <h2 className="text-base font-semibold text-foreground">No se trabaja este día</h2>
          <p className="text-sm text-foreground-muted">No tenés jornada laboral asignada ni se requiere un registro de asistencia.</p>
        </CardContent></Card>
      ) : (
        <section aria-labelledby="mi-jornada-asistencia" className="space-y-3">
          <div>
            <h2 id="mi-jornada-asistencia" className="text-base font-semibold text-foreground">Mi asistencia</h2>
            <p className="mt-1 text-sm text-foreground-muted">Registros personales asociados a esta jornada.</p>
          </div>
          {!jornada.estadoAsistencia ? <p className="text-sm text-foreground-muted">La asistencia de esta jornada aún no fue generada.</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <RegistroAsistenciaCard tipoRegistro="ingreso" registro={jornada.ingreso} />
            <RegistroAsistenciaCard tipoRegistro="egreso" registro={jornada.egreso} />
          </div>
        </section>
      )}
    </div>
  );
}
