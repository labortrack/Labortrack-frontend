import { Card, CardContent } from "@/shared/ui";
import type { ResumenOrganizacionalDto } from "../types/dashboard.types";
import { ResumenHeroPanel } from "./ResumenHeroPanel";
import { CuadrillasPorEstadoChart } from "./CuadrillasPorEstadoChart";
import { PersonalPorObraChart } from "./PersonalPorObraChart";
import { TendenciaAsistenciaSection } from "./TendenciaAsistenciaSection";

interface DashboardOrganizacionalProps {
  data: ResumenOrganizacionalDto;
}

export function DashboardOrganizacional({ data }: DashboardOrganizacionalProps) {
  return (
    <div className="space-y-6">
      <ResumenHeroPanel
        asistenciaPorcentaje={data.asistenciaHoyPorcentaje}
        empleadosActivos={data.totalEmpleadosActivos}
        obrasActivas={data.totalObrasActivas}
        ausenciasHoy={data.ausenciasHoy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Cuadrillas por frente
            </h3>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Distribución vigente según tu alcance.
            </p>
            <div className="mt-4">
              <CuadrillasPorEstadoChart data={data.cuadrillasPorEstado} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Personal por obra</h3>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Operarios vigentes en cada frente de trabajo.
            </p>
            <div className="mt-4">
              <PersonalPorObraChart data={data.personalPorObra} />
            </div>
          </CardContent>
        </Card>
      </div>

      <TendenciaAsistenciaSection />
    </div>
  );
}
