import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleX,
  Clock3,
  FileCheck2,
  History,
  LogIn,
  LogOut,
  MapPin,
  Settings2,
  Users,
} from "lucide-react";
import { AsistenciaEstadosTimeline } from "../components/AsistenciaEstadosTimeline";
import { AnulacionRegistroAsistenciaDialog } from "../components/AnulacionRegistroAsistenciaDialog";
import { AsistenciaInfoItem } from "../components/AsistenciaInfoItem";
import { AsistenciaStatusBadge } from "../components/AsistenciaStatusBadge";
import { RegistroAsistenciaCard } from "../components/RegistroAsistenciaCard";
import { RegistroManualAsistenciaDialog } from "../components/RegistroManualAsistenciaDialog";
import { TrabajadorAvatar } from "../components/TrabajadorAvatar";
import { useDetalleAsistenciaOperativa } from "../hooks/useAsistencias";
import type {
  AccionAsistenciaOperativa,
  TipoAnulacionRegistro,
  TipoRegistroManual,
} from "../types/asistencia.types";
import {
  ESTADO_JORNADA_LABELS,
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
import { Button, Card, CardContent, CardHeader } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

const ACCION_LABELS = {
  REGISTRAR_INGRESO_MANUAL: "Registrar ingreso manual",
  REGISTRAR_EGRESO_MANUAL: "Registrar egreso manual",
  REGULARIZAR_ASISTENCIA_OMITIDA: "Registrar asistencia omitida",
  ANULAR_INGRESO: "Anular ingreso",
  ANULAR_EGRESO: "Anular egreso",
  ANULAR_ASISTENCIA: "Anular asistencia",
} satisfies Record<AccionAsistenciaOperativa, string>;

export default function AsistenciaDetailPage() {
  const { asistenciaId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const volverAAsistencias = `/asistencias${location.search}`;
  const id = Number(asistenciaId);
  const idValido = Number.isInteger(id) && id > 0;
  const detalleQuery = useDetalleAsistenciaOperativa(idValido ? id : null);
  const [tipoRegistroManual, setTipoRegistroManual] =
    useState<TipoRegistroManual>();
  const [tipoAnulacionRegistro, setTipoAnulacionRegistro] =
    useState<TipoAnulacionRegistro>();

  if (!idValido) {
    return <Navigate to={volverAAsistencias} replace />;
  }

  if (detalleQuery.isPending) {
    return (
      <Card>
        <LoadingState label="Cargando el detalle operativo…" />
      </Card>
    );
  }

  if (detalleQuery.isError || !detalleQuery.data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(volverAAsistencias)}>
          <ArrowLeft />
          Volver a Asistencias
        </Button>
        <Card>
          <ErrorState
            message={
              normalizeApiError(
                detalleQuery.error,
                "No pudimos cargar el detalle de esta asistencia.",
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
        <Button
          variant="ghost"
          className="mb-3 -ml-3"
          onClick={() => navigate(volverAAsistencias)}
        >
          <ArrowLeft />
          Volver a Asistencias
        </Button>
        <PageHeader
          title="Detalle de asistencia"
          description={`Información operativa correspondiente al ${formatFecha(asistencia.fecha)}.`}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="h-1.5 bg-primary" />
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <TrabajadorAvatar
              nombre={asistencia.trabajador}
              fotoUrl={asistencia.fotoTrabajador}
              size="lg"
            />
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-foreground">
                {asistencia.trabajador}
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                {asistencia.obra.nombre} · {asistencia.cuadrilla}
              </p>
            </div>
          </div>
          <AsistenciaStatusBadge estado={asistencia.estado} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold">Datos de la jornada</h2>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                label="Fecha"
                value={formatFecha(asistencia.fecha)}
              />
              <AsistenciaInfoItem
                icon={FileCheck2}
                label="Jornada asociada"
                value={`Jornada #${asistencia.jornadaId}`}
              />
              <AsistenciaInfoItem
                icon={CalendarDays}
                label="Tipo de jornada"
                value={TIPO_JORNADA_LABELS[asistencia.tipoJornada]}
              />
              <AsistenciaInfoItem
                icon={Clock3}
                label="Horario planificado"
                value={`${formatHora(asistencia.horaInicioPlanificada)} a ${formatHora(asistencia.horaFinPlanificada)}`}
              />
              <AsistenciaInfoItem
                icon={FileCheck2}
                label="Estado de jornada"
                value={ESTADO_JORNADA_LABELS[asistencia.estadoJornada]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold">
                Registro de ingreso y egreso
              </h2>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <RegistroAsistenciaCard
                tipoRegistro="ingreso"
                registro={asistencia.ingreso}
              />
              <RegistroAsistenciaCard
                tipoRegistro="egreso"
                registro={asistencia.egreso}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <History className="size-5 text-primary" />
              <h2 className="text-base font-semibold">Trazabilidad</h2>
            </CardHeader>
            <CardContent>
              {asistencia.historialEstados.length > 0 ? (
                <AsistenciaEstadosTimeline
                  historial={asistencia.historialEstados}
                />
              ) : (
                <EmptyState title="No hay cambios registrados" />
              )}
            </CardContent>
          </Card>

          {asistencia.accionesDisponibles.length > 0 ? (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Settings2 className="size-5 text-primary" />
                <h2 className="text-base font-semibold">
                  Acciones disponibles
                </h2>
              </CardHeader>
              <CardContent className="space-y-2">
                {asistencia.accionesDisponibles.map((accion) => (
                  accion === "REGISTRAR_INGRESO_MANUAL" ||
                  accion === "REGISTRAR_EGRESO_MANUAL" ? (
                    <Button
                      key={accion}
                      className="w-full justify-between"
                      onClick={() =>
                        setTipoRegistroManual(
                          accion === "REGISTRAR_INGRESO_MANUAL"
                            ? "ingreso"
                            : "egreso",
                        )
                      }
                    >
                      <span className="flex items-center gap-2">
                        {accion === "REGISTRAR_INGRESO_MANUAL" ? (
                          <LogIn />
                        ) : (
                          <LogOut />
                        )}
                        {ACCION_LABELS[accion]}
                      </span>
                    </Button>
                  ) : accion === "ANULAR_INGRESO" ||
                    accion === "ANULAR_EGRESO" ? (
                    <Button
                      key={accion}
                      variant="destructive"
                      className="w-full justify-between"
                      onClick={() =>
                        setTipoAnulacionRegistro(
                          accion === "ANULAR_INGRESO" ? "ingreso" : "egreso",
                        )
                      }
                    >
                      <span className="flex items-center gap-2">
                        <CircleX />
                        {ACCION_LABELS[accion]}
                      </span>
                    </Button>
                  ) : (
                    <div
                      key={accion}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-subtle px-3 py-2.5"
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {ACCION_LABELS[accion]}
                      </span>
                      <span className="rounded-full bg-primary-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                        Disponible
                      </span>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {tipoRegistroManual ? (
        <RegistroManualAsistenciaDialog
          open
          tipo={tipoRegistroManual}
          asistencia={asistencia}
          onOpenChange={(open) => {
            if (!open) setTipoRegistroManual(undefined);
          }}
        />
      ) : null}

      {tipoAnulacionRegistro ? (
        <AnulacionRegistroAsistenciaDialog
          open
          tipo={tipoAnulacionRegistro}
          asistencia={asistencia}
          onOpenChange={(open) => {
            if (!open) setTipoAnulacionRegistro(undefined);
          }}
        />
      ) : null}
    </div>
  );
}
