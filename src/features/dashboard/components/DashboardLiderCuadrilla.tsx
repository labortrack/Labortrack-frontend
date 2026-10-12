import { CalendarX2, HardHat, Percent, UserRoundX, Users } from "lucide-react";
import type { ResumenCuadrillaDto } from "../types/dashboard.types";
import { AccesosRapidosLider } from "./AccesosRapidosLider";
import { DashboardSectionCard } from "./DashboardSectionCard";
import { KpiTile } from "./KpiTile";
import { MisCuadrillasList } from "./MisCuadrillasList";
import { PendientesFicharList } from "./PendientesFicharList";
import { TendenciaAsistenciaSection } from "./TendenciaAsistenciaSection";

interface DashboardLiderCuadrillaProps {
  data: ResumenCuadrillaDto;
}

export function DashboardLiderCuadrilla({ data }: DashboardLiderCuadrillaProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiTile
          icon={Percent}
          label="Asistencia de hoy"
          value={`${data.asistenciaHoyPorcentaje.toFixed(0)}%`}
          subtitle="De tu equipo"
        />
        <KpiTile
          icon={CalendarX2}
          label="Ausentes hoy"
          value={data.ausentesHoy}
        />
        <KpiTile
          icon={Users}
          label="Personal vigente"
          value={data.totalPersonalVigente}
          subtitle={`En ${data.misCuadrillas.length} cuadrilla${data.misCuadrillas.length !== 1 ? "s" : ""}`}
        />
      </div>

      <AccesosRapidosLider />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <DashboardSectionCard
          icon={HardHat}
          title="Mis cuadrillas"
          subtitle="Cuadrillas a tu cargo y su jornada de hoy."
          className="lg:col-span-3"
        >
          <MisCuadrillasList data={data.misCuadrillas} />
        </DashboardSectionCard>

        <DashboardSectionCard
          icon={UserRoundX}
          title="Pendientes de fichar"
          subtitle="Sin ingreso registrado o ausentes hoy."
          action={{ label: "Ver parte diario", to: "/asistencias" }}
          className="lg:col-span-2"
        >
          <PendientesFicharList
            data={data.pendientesHoy}
            mostrarCuadrilla={data.misCuadrillas.length > 1}
          />
        </DashboardSectionCard>
      </div>

      <TendenciaAsistenciaSection />
    </div>
  );
}
