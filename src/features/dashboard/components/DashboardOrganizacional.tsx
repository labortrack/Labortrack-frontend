import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { useCapacidadesAsistencia } from "@/features/asistencia/hooks/useAsistencias";
import type { ResumenOrganizacionalDto } from "../types/dashboard.types";
import { ResumenHeroPanel } from "./ResumenHeroPanel";
import { CuadrillasPorEstadoChart } from "./CuadrillasPorEstadoChart";
import { PersonalPorObraChart } from "./PersonalPorObraChart";
import { TendenciaAsistenciaSection } from "./TendenciaAsistenciaSection";
import { LecturaRecibosSection } from "./LecturaRecibosSection";
import { useSessionStore } from "@/features/auth/store/sessionStore";

const TODAS = "todas";

interface DashboardOrganizacionalProps {
  data: ResumenOrganizacionalDto;
  obraId?: number;
  onObraChange: (obraId: number | undefined) => void;
  /** Hay un cambio de filtro en curso y se muestran los datos anteriores. */
  actualizando?: boolean;
}

/** Link al parte diario filtrado. Sin fecha, el parte diario usa la fecha local de hoy. */
function crearLinkParteDiario(filtros: { fecha?: string; obraId?: number; estado?: string }) {
  const params = new URLSearchParams();
  if (filtros.fecha) params.set("fecha", filtros.fecha);
  if (filtros.obraId) params.set("obraId", String(filtros.obraId));
  if (filtros.estado) params.set("estado", filtros.estado);
  return `/asistencias?${params.toString()}`;
}

export function DashboardOrganizacional({
  data,
  obraId,
  onObraChange,
  actualizando = false,
}: DashboardOrganizacionalProps) {
  // Solo quien tiene acceso a recibos de sueldo ve el indicador de lectura.
  const accesoRecibos = useSessionStore((state) => state.user?.rol) === "ROLE_ADMIN";
  const navigate = useNavigate();
  const puedeVerParteDiario =
    useCapacidadesAsistencia().data?.parteDiario?.puedeConsultar ?? false;

  // Personal por obra llega sin filtrar, así que sirve como lista de obras del alcance.
  const obras = [...data.personalPorObra].sort((a, b) =>
    a.nomenclatura.localeCompare(b.nomenclatura)
  );
  const obraSeleccionada = data.personalPorObra.find((o) => o.obraId === obraId);

  return (
    <div className="space-y-6">
      {obras.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Filtrar por obra</p>
              <p className="text-xs text-foreground-muted">
                También podés hacer click en una barra de “Personal por obra”.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:w-96">
              <Select
                value={obraId ? String(obraId) : TODAS}
                onValueChange={(value) => onObraChange(value === TODAS ? undefined : Number(value))}
              >
                <SelectTrigger aria-label="Filtrar por obra" className="min-w-0">
                  <SelectValue placeholder="Todas las obras" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODAS}>Todas las obras</SelectItem>
                  {obras.map((obra) => (
                    <SelectItem key={obra.obraId} value={String(obra.obraId)}>
                      {obra.nomenclatura} · {obra.nombreObra}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {obraId ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar filtro de obra"
                  title="Quitar filtro de obra"
                  onClick={() => onObraChange(undefined)}
                >
                  <X />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div
        className={cn("space-y-6 transition-opacity", actualizando && "opacity-60")}
        aria-busy={actualizando}
      >
        <ResumenHeroPanel
          asistenciaPorcentaje={data.asistenciaHoyPorcentaje}
          empleadosActivos={data.totalEmpleadosActivos}
          obrasActivas={data.totalObrasActivas}
          ausenciasHoy={data.ausenciasHoy}
          obraFiltrada={obraSeleccionada?.nomenclatura}
          ausenciasHref={
            puedeVerParteDiario
              ? crearLinkParteDiario({ obraId, estado: "AUSENTE" })
              : undefined
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-2">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Cuadrillas por frente
              </h3>
              <p className="mt-0.5 text-xs text-foreground-muted">
                {obraSeleccionada
                  ? `Distribución vigente en ${obraSeleccionada.nomenclatura}.`
                  : "Distribución vigente según tu alcance."}
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
                Las 5 obras con más operarios vigentes. Click en una barra para filtrar.
              </p>
              <div className="mt-4">
                <PersonalPorObraChart
                  data={data.personalPorObra}
                  obraSeleccionadaId={obraId}
                  onObraClick={(id) => onObraChange(id === obraId ? undefined : id)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TendenciaAsistenciaSection
        obraId={obraId}
        obraNomenclatura={obraSeleccionada?.nomenclatura}
        onDiaClick={
          puedeVerParteDiario
            ? (fecha) => navigate(crearLinkParteDiario({ fecha, obraId }))
            : undefined
        }
      />

      {accesoRecibos ? <LecturaRecibosSection /> : null}
    </div>
  );
}
