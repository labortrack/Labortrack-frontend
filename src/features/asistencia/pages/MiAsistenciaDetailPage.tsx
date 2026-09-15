import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  History,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import { AsistenciaEstadosTimeline } from "../components/AsistenciaEstadosTimeline";
import { AsistenciaInfoItem } from "../components/AsistenciaInfoItem";
import { AsistenciaStatusBadge } from "../components/AsistenciaStatusBadge";
import { RegistroAsistenciaCard } from "../components/RegistroAsistenciaCard";
import { useDetalleAsistenciaPropia } from "../hooks/useAsistencias";
import {
  formatFecha,
  formatHora,
  formatUbicacionObra,
  TIPO_JORNADA_LABELS,
} from "../utils/asistenciaFormatters";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import { Card, CardContent, CardHeader } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export default function MiAsistenciaDetailPage() {
  const { asistenciaId } = useParams();
  const navigate = useNavigate();
  const id = Number(asistenciaId);
  const idValido = Number.isInteger(id) && id > 0;
  const detalleQuery = useDetalleAsistenciaPropia(idValido ? id : null);

  if (!idValido) {
    return <Navigate to="/mis-asistencias" replace />;
  }

  if (detalleQuery.isPending) {
    return (
      <Card>
        <LoadingState label="Cargando el detalle de tu asistencia..." />
      </Card>
    );
  }

  if (detalleQuery.isError || !detalleQuery.data) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/mis-asistencias")}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Volver a Mis asistencias
        </button>
        <Card>
          <ErrorState
            message={
              normalizeApiError(
                detalleQuery.error,
                "No se pudo cargar la asistencia solicitada.",
              ).message
            }
            onRetry={() => void detalleQuery.refetch()}
          />
        </Card>
      </div>
    );
  }

  const asistencia = detalleQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/mis-asistencias")}
          className="group mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Volver a Mis asistencias
        </button>
        <PageHeader
          title="Detalle de asistencia"
          description={`Asistencia correspondiente al ${formatFecha(asistencia.fecha)}.`}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="h-1.5 bg-primary" />
        <CardContent className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                Estado actual
              </span>
              <div className="mt-1">
                <AsistenciaStatusBadge estado={asistencia.estado} />
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatFecha(asistencia.fecha)}
            </span>
          </div>

          <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-3">
            <AsistenciaInfoItem
              icon={UserRound}
              label="Trabajador"
              value={asistencia.trabajador}
            />
            <AsistenciaInfoItem
              icon={Building2}
              label="Obra"
              value={asistencia.obra.nombre}
            />
            <AsistenciaInfoItem
              icon={MapPin}
              label="Ubicación"
              value={formatUbicacionObra(asistencia.obra)}
            />
            <AsistenciaInfoItem
              icon={Users}
              label="Cuadrilla"
              value={asistencia.cuadrilla}
            />
            <AsistenciaInfoItem
              icon={CalendarDays}
              label="Tipo de jornada"
              value={TIPO_JORNADA_LABELS[asistencia.tipoJornada]}
            />
            <AsistenciaInfoItem
              icon={Clock3}
              label="Horario planificado"
              value={`${formatHora(asistencia.horaInicioPlanificada)} a ${formatHora(
                asistencia.horaFinPlanificada,
              )}`}
            />
          </div>

          <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <RegistroAsistenciaCard
              tipoRegistro="ingreso"
              registro={asistencia.ingreso}
            />
            <RegistroAsistenciaCard
              tipoRegistro="egreso"
              registro={asistencia.egreso}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <History className="size-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Historial de estados
          </h2>
        </CardHeader>
        <CardContent>
          {asistencia.historialEstados.length === 0 ? (
            <EmptyState
              title="No hay cambios de estado registrados"
              description="Esta asistencia todavía no posee información histórica disponible."
            />
          ) : (
            <AsistenciaEstadosTimeline
              historial={asistencia.historialEstados}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
