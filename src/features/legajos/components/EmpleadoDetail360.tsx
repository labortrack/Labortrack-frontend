import { useRef } from "react";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Camera,
  CreditCard,
  Droplet,
  FileText,
  Globe,
  HeartPulse,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type {
  EmpleadoEstadoResponseDto,
  EmpleadoResponseDto,
} from "../types/legajo.types";
import {
  CATEGORIA_LABELS,
  ESTADO_LABELS,
  GENERO_LABELS,
} from "../types/legajo.types";
import { formatDate } from "./EmpleadoTable";
import { EmpleadoTimeline } from "./EmpleadoTimeline";
import { AvatarMinio } from "./AvatarMinio";
import { useActualizarFotoPerfil } from "../hooks/useLegajos";
import { Badge, Button, Spinner } from "@/shared/ui";

interface EmpleadoDetail360Props {
  legajo: EmpleadoResponseDto;
  historialEstados: EmpleadoEstadoResponseDto[];
  onBack?: () => void;
  onEdit?: () => void;
}

export function EmpleadoDetail360({
  legajo,
  historialEstados,
  onBack,
  onEdit,
}: EmpleadoDetail360Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actualizarFotoMutation = useActualizarFotoPerfil();

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await actualizarFotoMutation.mutateAsync({
        id: legajo.id,
        foto: file,
      });
      toast.success("Foto de perfil actualizada exitosamente.");
    } catch {
      toast.error("No se pudo actualizar la foto de perfil.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón de Retorno y Header Top */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <Button variant="outline" onClick={onBack} className="w-fit gap-2">
            <ArrowLeft className="size-4" />
            Volver al Listado
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {onEdit ? (
            <Button variant="outline" onClick={onEdit} className="gap-2">
              <Pencil className="size-4" />
              Editar Mis Datos
            </Button>
          ) : null}

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={actualizarFotoMutation.isPending}
            className="gap-2"
          >
            {actualizarFotoMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Camera className="size-4" />
            )}
            {actualizarFotoMutation.isPending ? "Subiendo..." : "Cambiar Foto"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png"
            className="hidden"
            onChange={handleFotoChange}
          />
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="rounded-card border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <AvatarMinio
              empleadoId={legajo.id}
              nombre={legajo.nombre}
              apellido={legajo.apellido}
              fotoPerfilKey={legajo.fotoPerfilKey}
              className="size-20 border-2 border-primary/20 shadow-soft"
              size="lg"
              allowZoom
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-foreground">
                  {legajo.nombre} {legajo.apellido}
                </h2>
                <Badge
                  variant={
                    legajo.estadoActual === "ACTIVO" ||
                    legajo.estadoActual === "EN_OBRA"
                      ? "success"
                      : "warning"
                  }
                >
                  {ESTADO_LABELS[legajo.estadoActual] || legajo.estadoActual}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-foreground-muted">
                DNI: <strong className="text-foreground">{legajo.dni}</strong> ·
                CUIL: <strong className="text-foreground">{legajo.cuil}</strong> ·
                N° IERIC:{" "}
                <strong className="text-foreground">
                  {legajo.numeroIeric || "-"}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Datos Personales y Operativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloque 1: Datos Personales */}
        <div className="rounded-card border border-border bg-card p-5 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="size-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Datos Personales
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                DNI / Documento
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <CreditCard className="size-3.5 text-foreground-muted" />
                {legajo.dni}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                CUIL / CUIT
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <FileText className="size-3.5 text-foreground-muted" />
                {legajo.cuil}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Fecha de Nacimiento
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="size-3.5 text-foreground-muted" />
                {formatDate(legajo.fechaNacimiento)}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Género
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <User className="size-3.5 text-foreground-muted" />
                {GENERO_LABELS[legajo.genero] || legajo.genero}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Nacionalidad
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Globe className="size-3.5 text-foreground-muted" />
                {legajo.nacionalidad}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Grupo Sanguíneo
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Droplet className="size-3.5 text-error" />
                {legajo.grupoSanguineo}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Teléfono de Celular
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Phone className="size-3.5 text-foreground-muted" />
                {legajo.numeroCelular}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Correo Electrónico
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="size-3.5 text-foreground-muted" />
                {legajo.email}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs text-foreground-muted block font-medium">
                Domicilio Declarado
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin className="size-3.5 text-foreground-muted" />
                {legajo.domicilio}
              </span>
            </div>
          </div>

          {/* Sub-bloque: Contacto de Emergencia */}
          <div className="mt-4 pt-3 border-t border-border rounded-lg bg-subtle/60 p-3.5">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-error">
              <HeartPulse className="size-4" />
              Contacto de Emergencia
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-foreground">
                {legajo.nombreContactoEmergencia}
              </p>
              <p className="text-foreground-muted flex items-center gap-1.5">
                <Phone className="size-3" />
                {legajo.celularContactoEmergencia}
              </p>
            </div>
          </div>
        </div>

        {/* Bloque 2: Datos Operativos */}
        <div className="rounded-card border border-border bg-card p-5 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Briefcase className="size-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Situación Operativa y Contractual
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Fecha de Ingreso
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="size-3.5 text-foreground-muted" />
                {formatDate(legajo.fechaIngreso)}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Categoría UOCRA Actual
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="size-3.5 text-primary" />
                {CATEGORIA_LABELS[legajo.categoriaActual] ||
                  legajo.categoriaActual}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Número de IERIC
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                <FileText className="size-3.5 text-foreground-muted" />
                {legajo.numeroIeric || "No registrado"}
              </span>
            </div>

            <div>
              <span className="text-xs text-foreground-muted block font-medium">
                Estado Actual
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                {ESTADO_LABELS[legajo.estadoActual] || legajo.estadoActual}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 3: Línea de Tiempo de Estados */}
      <EmpleadoTimeline historialEstados={historialEstados} />
    </div>
  );
}
