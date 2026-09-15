import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRightLeft,
  Building2,
  Globe,
  HardHat,
  History,
  Lock,
  Mail,
  MapPin,
  MonitorUp,
  Pencil,
  Phone,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import {
  AsignarCapatazDialog,
  CloseObraDialog,
  EditObraDialog,
  TransicionarEstadoObraDialog,
} from "../components/ObraDialogs";
import { CapatazAvatar } from "../components/CapatazAvatar";
import { HistorialEstadosTimeline } from "../components/HistorialEstadosTimeline";
import { EstadoBadge } from "../estado/components/EstadoBadge";
import { getEstadoStyle } from "../estado/utils/estadoStyles";
import { useHistorialEstadosObra, useObra } from "../hooks/useObras";
import {
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Separator,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useSessionStore } from "@/features/auth/store/sessionStore";

export default function ObraDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esAdmin = useSessionStore((state) => state.user?.rol === "ROLE_ADMIN");
  const obraId = Number(id);

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [transicionOpen, setTransicionOpen] = useState(false);
  const [asignarCapatazOpen, setAsignarCapatazOpen] = useState(false);

  const obraQuery = useObra(obraId);
  const historialQuery = useHistorialEstadosObra(obraId);

  const obra = obraQuery.data;
  const historial = historialQuery.data ?? [];

  if (obraQuery.isPending) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/obras")}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-primary cursor-pointer"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a Obras</span>
        </button>
        <Card className="p-12">
          <LoadingState label="Cargando información del frente de obra..." />
        </Card>
      </div>
    );
  }

  if (obraQuery.isError || !obra) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/obras")}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-primary cursor-pointer"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a Obras</span>
        </button>
        <Card className="p-8">
          <ErrorState
            message={
              normalizeApiError(
                obraQuery.error,
                "No se pudo cargar la información de la obra solicitada.",
              ).message
            }
            onRetry={() => void obraQuery.refetch()}
          />
        </Card>
      </div>
    );
  }

  const isFinalizada =
    obra.estadoActual.toUpperCase() === "SUSPENDIDA" ||
    obra.estadoActual.toUpperCase() === "FINALIZADA" ||
    obra.estadoActual.toUpperCase() === "ARCHIVADA";

  const estadoStyle = getEstadoStyle(obra.estadoActual);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb / Back ──────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/obras")}
          className="group mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-primary cursor-pointer"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver a Obras</span>
        </button>

        {/* ── Header ────────────────────────────────────────────── */}
        <PageHeader
          title={obra.nombreObra}
          description={`Nomenclatura Contractual: ${obra.nomenclatura} • ID #${obra.id}`}
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {esAdmin ? (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/obras/${obra.id}/qr`)}
                  className="w-full sm:w-auto justify-center gap-1.5 font-semibold shadow-xs"
                >
                  <MonitorUp className="size-4" />
                  Mostrar QR
                </Button>
              ) : null}
              <Button
                variant={esAdmin ? "outline" : "primary"}
                onClick={() => navigate(`/obras/${obra.id}/cuadrillas`)}
                className="w-full sm:w-auto justify-center gap-1.5 font-semibold shadow-xs"
              >
                <Users className="size-4" />
                Gestionar Cuadrillas
              </Button>
              <Button
                variant="outline"
                onClick={() => setTransicionOpen(true)}
                className="w-full sm:w-auto justify-center"
              >
                <ArrowRightLeft className="mr-1.5 size-4" />
                Cambiar Estado
              </Button>
              {esAdmin ? (
                <Button
                  variant="outline"
                  onClick={() => setAsignarCapatazOpen(true)}
                  disabled={isFinalizada}
                  className="w-full sm:w-auto justify-center"
                >
                  <HardHat className="mr-1.5 size-4" />
                  {obra.capataz ? "Cambiar Capataz" : "Asignar Capataz"}
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
                className="w-full sm:w-auto justify-center"
              >
                <Pencil className="mr-1.5 size-4" />
                Editar Datos
              </Button>
              <Button
                variant="destructive"
                onClick={() => setCloseOpen(true)}
                disabled={isFinalizada}
                className="w-full sm:w-auto justify-center"
              >
                <Trash2 className="mr-1.5 size-4" />
                Dar de Baja
              </Button>
            </div>
          }
        />
      </div>

      {/* ── Top Status Strip ────────────────────────────────────── */}
      <Card className="overflow-hidden border-border bg-card">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: estadoStyle.hex }}
        />
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Building2 className="size-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                Estado Actual del Proyecto
              </span>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <EstadoBadge estado={obra.estadoActual} className="text-sm px-3 py-1" />
                {obra.fechaInicioEstadoActual ? (
                  <span className="text-xs text-foreground-muted">
                    Vigente desde el {obra.fechaInicioEstadoActual}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-foreground-muted border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
            <MapPin className="size-4 text-primary" />
            <span>
              {obra.localidad}, {obra.provincia}, {obra.pais}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Grid: Info + Historial Timeline ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Technical & Geographic Info */}
        <div className="space-y-6">
          {/* Card: Ficha Técnica */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                Identificación Contractual
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div>
                <span className="text-xs font-medium text-foreground-muted block">
                  Nomenclatura (Inmutable)
                </span>
                <div className="mt-1 flex items-center justify-between rounded-md bg-subtle p-2.5 font-mono text-xs font-bold text-foreground">
                  <span>{obra.nomenclatura}</span>
                  <Lock className="size-3.5 text-foreground-muted" />
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-foreground-muted block">
                  Nombre Oficial
                </span>
                <p className="mt-0.5 font-semibold text-foreground">
                  {obra.nombreObra}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-foreground-muted block">
                  Identificador Interno
                </span>
                <p className="mt-0.5 font-mono text-xs text-foreground">
                  #{obra.id}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card: Capataz Responsable */}
          <Card>
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <HardHat className="size-4 text-primary" />
                Capataz Responsable
              </h3>
              {esAdmin && obra.capataz && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAsignarCapatazOpen(true)}
                  disabled={isFinalizada}
                  className="h-7 px-2 text-xs text-foreground-muted hover:text-primary cursor-pointer"
                >
                  <ArrowRightLeft className="size-3 mr-1" />
                  Cambiar
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              {obra.capataz ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CapatazAvatar
                      nombre={`${obra.capataz.nombre} ${obra.capataz.apellido}`}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {obra.capataz.nombre} {obra.capataz.apellido}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Jefatura de Obra
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1.5 text-xs text-foreground-muted">
                    <div className="flex items-center justify-between">
                      <span>DNI:</span>
                      <span className="font-mono font-medium text-foreground">
                        {obra.capataz.dni}
                      </span>
                    </div>
                    {obra.capataz.email ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 shrink-0">
                          <Mail className="size-3 text-primary/70" /> Email:
                        </span>
                        <span
                          className="truncate font-medium text-foreground text-right"
                          title={obra.capataz.email}
                        >
                          {obra.capataz.email}
                        </span>
                      </div>
                    ) : null}
                    {obra.capataz.telefono ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 shrink-0">
                          <Phone className="size-3 text-primary/70" /> Teléfono:
                        </span>
                        <span className="font-medium text-foreground">
                          {obra.capataz.telefono}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-center py-2">
                  <p className="text-xs text-foreground-muted">
                    No se encuentra asignado un capataz responsable a este proyecto.
                  </p>
                  {esAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAsignarCapatazOpen(true)}
                      disabled={isFinalizada}
                      className="w-full text-xs"
                    >
                      <UserCheck className="size-3.5 mr-1" />
                      Asignar Capataz
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Ubicación Geográfica */}
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                Ubicación Geográfica
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">País:</span>
                <span className="font-medium text-foreground">{obra.pais}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Provincia:</span>
                <span className="font-medium text-foreground">{obra.provincia}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Localidad:</span>
                <span className="font-medium text-foreground">{obra.localidad}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Historial de Auditoría de Estados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="size-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Historial de Estados y Auditoría
              </h2>
            </div>
            <span className="text-xs font-medium text-foreground-muted">
              {historial.length} evento{historial.length !== 1 ? "s" : ""} registrado{historial.length !== 1 ? "s" : ""}
            </span>
          </div>

          {historialQuery.isPending ? (
            <Card className="p-8">
              <LoadingState label="Cargando historial de auditoría..." />
            </Card>
          ) : historialQuery.isError ? (
            <Card className="p-6">
              <ErrorState
                message={
                  normalizeApiError(
                    historialQuery.error,
                    "No se pudo cargar el historial de estados.",
                  ).message
                }
                onRetry={() => void historialQuery.refetch()}
              />
            </Card>
          ) : (
            <HistorialEstadosTimeline historial={historial} />
          )}
        </div>
      </div>

      {/* ── Modales ────────────────────────────────────────────── */}
      <EditObraDialog
        key={editOpen ? `edit-${obra.id}` : "edit-closed"}
        obra={editOpen ? obra : null}
        onOpenChange={setEditOpen}
      />

      <CloseObraDialog
        key={closeOpen ? `close-${obra.id}` : "close-closed"}
        obra={closeOpen ? obra : null}
        onOpenChange={setCloseOpen}
      />

      <TransicionarEstadoObraDialog
        key={transicionOpen ? `trans-${obra.id}` : "trans-closed"}
        obra={transicionOpen ? obra : null}
        onOpenChange={setTransicionOpen}
      />

      <AsignarCapatazDialog
        key={asignarCapatazOpen ? `capataz-${obra.id}` : "capataz-closed"}
        obra={asignarCapatazOpen ? obra : null}
        open={asignarCapatazOpen}
        onOpenChange={setAsignarCapatazOpen}
      />
    </div>
  );
}
