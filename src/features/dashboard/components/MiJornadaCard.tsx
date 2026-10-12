import { CalendarClock, LogIn, LogOut } from "lucide-react";
import { AsistenciaStatusBadge } from "@/features/asistencia/components/AsistenciaStatusBadge";
import { formatFecha, formatHora } from "@/features/asistencia/utils/asistenciaFormatters";
import { fechaLocalHoy } from "@/features/ausentismo/utils/solicitudAusenciaFormatters";
import { JornadaStatusBadge } from "@/features/jornada/components/JornadaStatusBadge";
import type { MiJornadaDto } from "../types/dashboard.types";
import { DashboardSectionCard } from "./DashboardSectionCard";

interface MiJornadaCardProps {
  data: MiJornadaDto | null;
}

function Fichada({ icon: Icon, label, valor }: { icon: typeof LogIn; label: string; valor: string | null }) {
  return (
    <div className="flex items-center gap-2.5 rounded-control bg-subtle px-3 py-2.5">
      <Icon className="size-4 shrink-0 text-foreground-muted" />
      <div className="leading-tight">
        <p className="text-sm font-semibold tabular-nums text-foreground">{valor ? formatHora(valor) : "—"}</p>
        <p className="text-xs text-foreground-muted">{label}</p>
      </div>
    </div>
  );
}

export function MiJornadaCard({ data }: MiJornadaCardProps) {
  const esHoy = data?.jornada.fecha === fechaLocalHoy();

  return (
    <DashboardSectionCard
      icon={CalendarClock}
      title={data && !esHoy ? "Mi próxima jornada" : "Mi jornada de hoy"}
      action={{ label: "Mis asistencias", to: "/mis-asistencias" }}
    >
      {data ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {formatHora(data.jornada.horaInicio)}–{formatHora(data.jornada.horaFin)}
              </p>
              <p className="text-xs text-foreground-muted">
                {esHoy ? "Hoy" : formatFecha(data.jornada.fecha)} · {data.nombreCuadrilla}
                {data.jornada.extraordinaria ? " · Extraordinaria" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <JornadaStatusBadge estado={data.jornada.estado} />
              {data.estadoAsistencia ? <AsistenciaStatusBadge estado={data.estadoAsistencia} /> : null}
            </div>
          </div>
          {esHoy ? (
            <div className="grid grid-cols-2 gap-2">
              <Fichada icon={LogIn} label="Ingreso" valor={data.ingreso} />
              <Fichada icon={LogOut} label="Egreso" valor={data.egreso} />
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-foreground-muted">No tenés jornadas programadas.</p>
      )}
    </DashboardSectionCard>
  );
}
