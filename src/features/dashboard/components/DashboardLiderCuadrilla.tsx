import { CalendarX2, HardHat, Percent, Users } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import type { ResumenCuadrillaDto } from "../types/dashboard.types";
import { KpiTile } from "./KpiTile";
import { MisCuadrillasList } from "./MisCuadrillasList";
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

      <Card>
        <CardContent className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <HardHat className="size-4 text-primary" />
            Mis cuadrillas
          </h3>
          <p className="mt-0.5 text-xs text-foreground-muted">
            Cuadrillas donde tenés responsabilidad vigente de líder.
          </p>
          <div className="mt-4">
            <MisCuadrillasList data={data.misCuadrillas} />
          </div>
        </CardContent>
      </Card>

      <TendenciaAsistenciaSection />
    </div>
  );
}
