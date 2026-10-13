import { Building2, CalendarOff, ChevronRight, Clock3, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { AsistenciaStatusBadge } from "@/features/asistencia/components/AsistenciaStatusBadge";
import { Card, CardContent } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import type { MiJornadaResumen } from "../types/misJornadas.types";
import { JornadaStatusBadge } from "./JornadaStatusBadge";
import { formatDate, formatTime, tipoJornadaLabels } from "../utils/planTrabajoFormatters";

interface MiJornadaCardProps {
  jornada: MiJornadaResumen;
  destacada?: boolean;
  volver: string;
}

export function MiJornadaCard({ jornada, destacada = false, volver }: MiJornadaCardProps) {
  const sinTrabajo = jornada.noRequiereAsistencia || jornada.estado === "NO_TRABAJADA";
  const detalle = `/mis-jornadas/${jornada.id}?${new URLSearchParams({ volver })}`;

  return (
    <Card className={cn("overflow-hidden", destacada && "border-primary/30")}>
      {destacada ? <div className="h-1 bg-primary" /> : null}
      <CardContent className="flex flex-col gap-0 p-0 md:flex-row">
        <div className={cn("flex shrink-0 flex-col justify-center border-b border-border p-4 md:w-44 md:border-b-0 md:border-r md:p-5", destacada ? "bg-primary-soft" : "bg-subtle")}>
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Fecha</span>
          <span className="mt-1 text-base font-semibold text-foreground">{formatDate(jornada.fecha)}</span>
          <span className="mt-1 text-xs text-foreground-muted">{tipoJornadaLabels[jornada.tipo]}</span>
        </div>
        <div className="min-w-0 flex-1 p-4 md:p-5">
          {sinTrabajo ? (
            <div className="mb-4 flex items-start gap-3">
              <CalendarOff className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">Día no laborable: no se trabaja</p>
                <p className="text-sm text-foreground-muted">No tenés jornada laboral asignada ni asistencia que registrar ese día.</p>
              </div>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Info icon={Building2} label="Obra" value={jornada.obraNombre} />
            <Info icon={Users} label="Cuadrilla" value={jornada.cuadrillaNombre} />
            {!sinTrabajo ? <Info icon={Clock3} label="Horario planificado" value={`${formatTime(jornada.horaInicioPlanificada)} a ${formatTime(jornada.horaFinPlanificada)}`} /> : null}
            <div className="flex flex-wrap items-center gap-2">
              <JornadaStatusBadge estado={jornada.estado} />
              {!sinTrabajo && jornada.estadoAsistencia ? <AsistenciaStatusBadge estado={jornada.estadoAsistencia} /> : null}
              {!sinTrabajo && !jornada.estadoAsistencia ? <span className="text-xs text-foreground-muted">Asistencia aún no generada</span> : null}
              {jornada.extraordinaria ? <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground-muted"><Zap className="size-3.5" aria-hidden="true" />Extraordinaria</span> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center border-t border-border px-4 py-3 md:border-l md:border-t-0 md:px-5">
          <Link to={detalle} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">
            Ver detalle <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <span className="block text-xs font-medium text-foreground-muted">{label}</span>
        <span className="break-words text-sm font-semibold text-foreground">{value}</span>
      </div>
    </div>
  );
}
