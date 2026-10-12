import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  FileText,
  HardHat,
  ShieldCheck,
} from "lucide-react";
import { formatFecha } from "@/features/asistencia/utils/asistenciaFormatters";
import type { ResumenPersonalDto } from "../types/dashboard.types";
import { CalendarioAsistenciaMes } from "./CalendarioAsistenciaMes";
import { DashboardSectionCard } from "./DashboardSectionCard";
import { KpiTile } from "./KpiTile";
import { MiAsignacionCard } from "./MiAsignacionCard";
import { MiJornadaCard } from "./MiJornadaCard";
import { SolicitudesRecientesList } from "./SolicitudesRecientesList";

interface DashboardPersonalProps {
  data: ResumenPersonalDto;
}

export function DashboardPersonal({ data }: DashboardPersonalProps) {
  const diasComputados = data.presentesMes + data.ausentesMes;
  const porcentajeMes = diasComputados === 0 ? null : (data.presentesMes * 100) / diasComputados;

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MiJornadaCard data={data.miJornada} />
        <MiAsignacionCard data={data.asignacionActual} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardSectionCard
          icon={CalendarDays}
          title="Mi asistencia del mes"
          subtitle={
            porcentajeMes === null
              ? "Sin días computados todavía."
              : `${porcentajeMes.toFixed(0)}% de asistencia en los días computados.`
          }
        >
          <CalendarioAsistenciaMes data={data.asistenciasMes} />
        </DashboardSectionCard>

        <DashboardSectionCard
          icon={CalendarX2}
          title="Mis solicitudes de ausencia"
          subtitle="Las más recientes."
          action={{ label: "Ver todas", to: "/mis-ausencias" }}
        >
          <SolicitudesRecientesList data={data.solicitudesRecientes} />
        </DashboardSectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardSectionCard
          icon={FileText}
          title="Último recibo de sueldo"
          action={{ label: "Mi documentación", to: "/documentacion" }}
        >
          {data.ultimoRecibo ? (
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {data.ultimoRecibo.nombreDocumento}
                </p>
                <p className="text-xs text-foreground-muted">
                  Cargado el {formatFecha(data.ultimoRecibo.fechaSubida.split("T")[0])}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground-muted">Todavía no hay recibos cargados.</p>
          )}
        </DashboardSectionCard>

        <DashboardSectionCard
          icon={ShieldCheck}
          title="Mis EPP"
          subtitle="Últimas entregas de equipos de protección."
          action={{ label: "Ver historial", to: "/mis-epps" }}
        >
          {data.ultimosEpp.length > 0 ? (
            <ul className="divide-y divide-border">
              {data.ultimosEpp.map((entrega, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                    <HardHat className="size-4 shrink-0 text-foreground-muted" />
                    <span className="truncate">
                      {entrega.nombreEpp}
                      {entrega.cantidad && entrega.cantidad > 1 ? ` ×${entrega.cantidad}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-foreground-muted">
                    {formatFecha(entrega.fechaEntrega)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-foreground-muted">No tenés entregas de EPP registradas.</p>
          )}
        </DashboardSectionCard>
      </div>
    </div>
  );
}
