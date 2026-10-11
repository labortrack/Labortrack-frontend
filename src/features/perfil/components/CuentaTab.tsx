import { useState, type ComponentType, type ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  FileUser,
  Hash,
  KeyRound,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { CurrentUser } from "@/features/auth/types/auth.types";
import { rolLabels } from "@/features/auth/types/auth.types";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { useEmpresa } from "@/features/empresa/hooks/useEmpresa";
import { RUBRO_LABELS } from "@/features/empresa/utils/rubroLabels";
import { formatCuit } from "@/shared/utils/cuit";
import { Badge, Button, Card, CardContent, CardHeader } from "@/shared/ui";
import type { EmpleadoResponseDto } from "@/features/legajos/types/legajo.types";

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

interface CuentaTabProps {
  user: CurrentUser;
  legajo?: EmpleadoResponseDto;
  isLoadingLegajo: boolean;
}

export function CuentaTab({
  user,
  legajo,
  isLoadingLegajo,
}: CuentaTabProps) {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const { data: empresa } = useEmpresa();

  return (
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
              {isLoadingLegajo ? (
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
              Usá una contraseña que no utilices en otros servicios y cambiala si
              creés que alguien más la conoce.
            </p>
            <p className="text-xs text-foreground-muted">
              Si ingresás con Google no tenés contraseña local: usá
              &apos;Recuperar contraseña&apos; desde la pantalla de inicio.
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

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}
