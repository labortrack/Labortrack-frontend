import { CalendarClock, CalendarCheck, CalendarX2 } from "lucide-react";
import type { ResumenPersonalDto } from "../types/dashboard.types";
import { KpiTile } from "./KpiTile";
import { MiAsignacionCard } from "./MiAsignacionCard";

interface DashboardPersonalProps {
  data: ResumenPersonalDto;
}

export function DashboardPersonal({ data }: DashboardPersonalProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiTile
          icon={CalendarCheck}
          label="Presentes este mes"
          value={data.presentesMes}
        />
        <KpiTile
          icon={CalendarX2}
          label="Ausentes este mes"
          value={data.ausentesMes}
        />
        <KpiTile
          icon={CalendarClock}
          label="Solicitudes pendientes"
          value={data.solicitudesAusenciaPendientes}
          subtitle="De ausencia"
        />
      </div>

      <MiAsignacionCard data={data.asignacionActual} />
    </div>
  );
}
