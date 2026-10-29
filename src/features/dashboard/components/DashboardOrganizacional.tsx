import { X } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { fechaLocalActual } from "@/shared/utils/fechaLocal";
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
  /** Día pasado que se está consultando; sin fecha, el tablero muestra hoy. */
  fecha?: string;
  onFechaChange: (fecha: string | undefined) => void;
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

function formatFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

export function DashboardOrganizacional({
  data,
  obraId,
  onObraChange,
  fecha,
  onFechaChange,
  actualizando = false,
}: DashboardOrganizacionalProps) {
  // Solo quien tiene acceso a recibos de sueldo ve el indicador de lectura.
  const accesoRecibos = useSessionStore((state) => state.user?.rol) === "ROLE_ADMIN";
  const puedeVerParteDiario =
    useCapacidadesAsistencia().data?.parteDiario?.puedeConsultar ?? false;

  const hoy = fechaLocalActual();
  // Personal por obra llega sin filtrar por obra, así que sirve como lista de obras del alcance.
  const obras = [...data.personalPorObra].sort((a, b) =>
    a.nomenclatura.localeCompare(b.nomenclatura)
  );
  const obraSeleccionada = data.personalPorObra.find((o) => o.obraId === obraId);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,24rem)_minmax(0,1fr)] lg:items-end">
          <div>
            <Label htmlFor="dashboard-fecha" className="mb-1.5 block">
              Ver al día
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="dashboard-fecha"
                type="date"
                max={hoy}
                value={fecha ?? hoy}
                onChange={(event) => onFechaChange(event.target.value || undefined)}
                className="w-44"
              />
              {fecha ? (
                <Button variant="outline" size="sm" onClick={() => onFechaChange(undefined)}>
                  Hoy
                </Button>
              ) : null}
            </div>
          </div>

          {obras.length > 0 ? (
            <div className="min-w-0">
              <Label className="mb-1.5 block">Obra</Label>
              <div className="flex items-center gap-2">
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
            </div>
          ) : null}

          <p className="text-xs text-foreground-muted sm:col-span-2 lg:col-span-1 lg:pb-2.5">
            Click en una barra de “Personal por obra” para filtrar por obra, o en un día de
            la tendencia para ver el tablero de esa fecha.
          </p>
        </CardContent>
      </Card>

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
          fechaFiltrada={fecha ? formatFecha(fecha) : undefined}
          ausenciasHref={
            puedeVerParteDiario
              ? crearLinkParteDiario({ fecha, obraId, estado: "AUSENTE" })
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
                  ? `Distribución en ${obraSeleccionada.nomenclatura}`
                  : "Distribución según tu alcance"}
                {fecha ? ` al ${formatFecha(fecha)}.` : "."}
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
                Las 5 obras con más operarios vigentes{fecha ? ` al ${formatFecha(fecha)}` : ""}.
                Click en una barra para filtrar.
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
        hasta={fecha}
        // El día clickeado pasa a ser la fecha del tablero; otro click lo vuelve a hoy.
        onDiaClick={(dia) => onFechaChange(dia === fecha ? undefined : dia)}
      />

      {accesoRecibos ? <LecturaRecibosSection /> : null}
    </div>
  );
}
