import { useState, type ComponentType, type ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  FileUser,
  Hash,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import { Avatar, Badge, Button, Card, CardContent, CardHeader } from "@/shared/ui";
import { formatCuit } from "@/shared/utils/cuit";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { rolLabels } from "@/features/auth/types/auth.types";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";
import { RUBRO_LABELS } from "@/features/empresa/utils/rubroLabels";
import { useHistorialEstados, useMiLegajo } from "@/features/legajos/hooks/useLegajos";
import { EmpleadoDetail360 } from "@/features/legajos/components/EmpleadoDetail360";
import { EmpleadoForm } from "@/features/legajos/components/EmpleadoForm";
import { PoliticaPrivacidad } from "../components/PoliticaPrivacidad";

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
        {label}
      </dt>
      <dd className="break-words text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

// Perfil propio de cualquier usuario: cuenta de acceso, empresa, legajo (si tiene
// uno asociado) y política de privacidad. Se llega tocando el perfil en el aside.
export default function MisDatosPage() {
  const user = useSessionStore((state) => state.user)!;
  const [isEditing, setIsEditing] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const { data: empresa } = useEmpresa();
  const { data: legajo, isLoading, isError } = useMiLegajo();
  const { data: historialEstadosData } = useHistorialEstados(legajo?.id);
  const esOperario = user.rol === "ROLE_OPERARIO";
  const nombreCompleto = `${user.nombre} ${user.apellido}`;
  const initials =
    `${user.nombre.at(0) ?? ""}${user.apellido.at(0) ?? ""}`.toUpperCase();
  const nombreEmpresa = empresa?.nombreEmpresa || empresa?.razonSocial;

  if (isEditing && legajo) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Modificar Mis Datos"
          description="Actualizá tu domicilio, teléfono o contactos de emergencia."
        />
        <EmpleadoForm
          empleadoId={legajo.id}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Datos"
        description="Tu cuenta, tu información laboral y cómo se tratan tus datos personales."
      />

      {/* ── Encabezado de perfil ───────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary to-primary/70" />
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
          <Avatar className="-mt-10 size-20 border-4 border-card text-2xl shadow-soft">
            {initials || "US"}
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold text-foreground">
                {nombreCompleto}
              </h2>
              <Badge variant="primary">{rolLabels[user.rol]}</Badge>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground-muted">
              <span className="flex min-w-0 items-center gap-1.5">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </span>
              {nombreEmpresa ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <Building2 className="size-4 shrink-0" />
                  <span className="truncate">{nombreEmpresa}</span>
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Información de la cuenta ─────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <SectionTitle
              icon={UserRound}
              title="Información de la cuenta"
              description="Datos con los que accedés a LaborTrack."
            />
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre">{user.nombre}</Field>
              <Field label="Apellido">{user.apellido}</Field>
              <Field label="Correo electrónico">
                <a
                  href={`mailto:${user.email}`}
                  className="text-primary hover:underline"
                >
                  {user.email}
                </a>
              </Field>
              <Field label="Rol en el sistema">{rolLabels[user.rol]}</Field>
              <Field label="Número de usuario">
                <span className="inline-flex items-center gap-1">
                  <Hash className="size-3.5 text-foreground-muted" />
                  {user.idUsuario}
                </span>
              </Field>
              <Field label="Estado de la cuenta">
                <Badge variant="success" className="gap-1">
                  <BadgeCheck className="size-3.5" />
                  Activa
                </Badge>
              </Field>
              <Field label="Legajo asociado">
                {isLoading ? (
                  <span className="text-foreground-muted">Consultando...</span>
                ) : legajo ? (
                  <span className="inline-flex items-center gap-1">
                    <FileUser className="size-3.5 text-foreground-muted" />
                    Legajo #{legajo.id}
                  </span>
                ) : (
                  <span className="text-foreground-muted">Sin legajo asociado</span>
                )}
              </Field>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* ── Seguridad ──────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <SectionTitle
                icon={ShieldCheck}
                title="Seguridad"
                description="Protegé el acceso a tu cuenta."
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground-muted">
                Usá una contraseña que no utilices en otros servicios y cambiala
                si creés que alguien más la conoce.
              </p>
              <Button
                variant="outline"
                onClick={() => setChangePasswordOpen(true)}
                className="w-full gap-1.5"
              >
                <KeyRound className="size-4" />
                Cambiar contraseña
              </Button>
            </CardContent>
          </Card>

          {/* ── Empresa ────────────────────────────────────────── */}
          {empresa ? (
            <Card>
              <CardHeader>
                <SectionTitle
                  icon={Building2}
                  title="Empresa"
                  description="Organización a la que pertenece tu cuenta."
                />
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <Field label="Razón social">{empresa.razonSocial}</Field>
                  <Field label="CUIT">{formatCuit(empresa.cuit)}</Field>
                  <Field label="Dirección">{empresa.direccionEmpresa}</Field>
                  <Field label="Contacto">
                    <a
                      href={`mailto:${empresa.emailEmpresa}`}
                      className="text-primary hover:underline"
                    >
                      {empresa.emailEmpresa}
                    </a>
                  </Field>
                  {empresa.rubros.length > 0 ? (
                    <Field label="Rubros">
                      <span className="flex flex-wrap gap-1.5 pt-0.5">
                        {empresa.rubros.map((rubro) => (
                          <Badge key={rubro}>{RUBRO_LABELS[rubro]}</Badge>
                        ))}
                      </span>
                    </Field>
                  ) : null}
                </dl>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* ── Legajo ─────────────────────────────────────────────── */}
      {isLoading ? (
        <Card>
          <LoadingState label="Cargando tus datos laborales y personales..." />
        </Card>
      ) : legajo ? (
        <EmpleadoDetail360
          legajo={legajo}
          historialEstados={historialEstadosData || []}
          onEdit={() => setIsEditing(true)}
        />
      ) : isError && esOperario ? (
        // Un operario siempre debería tener legajo; admin y RRHH pueden no tenerlo.
        <Card className="p-6">
          <EmptyState
            title="Tu usuario aún no tiene un legajo asociado"
            description="Comunicate con el área de Recursos Humanos para que asocien tu cuenta de acceso a tu legajo digital."
          />
        </Card>
      ) : null}

      {/* ── Privacidad ─────────────────────────────────────────── */}
      <PoliticaPrivacidad />

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}
