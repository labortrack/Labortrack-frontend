import { Card, CardContent } from "@/shared/ui";
import type { ResumenOrganizacionalDto } from "../types/dashboard.types";
import { ResumenHeroPanel } from "./ResumenHeroPanel";
import { CuadrillasPorEstadoChart } from "./CuadrillasPorEstadoChart";
import { PersonalPorObraChart } from "./PersonalPorObraChart";
import { TendenciaAsistenciaSection } from "./TendenciaAsistenciaSection";
import { LecturaRecibosSection } from "./LecturaRecibosSection";
import { useSessionStore } from "@/features/auth/store/sessionStore";

interface DashboardOrganizacionalProps {
  data: ResumenOrganizacionalDto;
}

export function DashboardOrganizacional({ data }: DashboardOrganizacionalProps) {
  // Solo quien tiene acceso a recibos de sueldo ve el indicador de lectura.
  const accesoRecibos = useSessionStore((state) => state.user?.rol) === "ROLE_ADMIN";

  return (
    <div className="space-y-6">
      <ResumenHeroPanel
        asistenciaPorcentaje={data.asistenciaHoyPorcentaje}
        empleadosActivos={data.totalEmpleadosActivos}
        obrasActivas={data.totalObrasActivas}
        ausenciasHoy={data.ausenciasHoy}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
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
        <Card className="lg:col-span-3">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground">Personal por obra</h3>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Las 5 obras con más operarios vigentes.
            </p>
            <div className="mt-4">
              <PersonalPorObraChart data={data.personalPorObra} />
            </div>
          </CardContent>
        </Card>
      </div>

      <TendenciaAsistenciaSection />

      {accesoRecibos ? <LecturaRecibosSection /> : null}
    </div>
  );
}
