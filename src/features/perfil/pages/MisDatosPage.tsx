import { useState } from "react";
import { KeyRound, Mail } from "lucide-react";
import {
  EmptyState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import { Avatar, Badge, Button, Card } from "@/shared/ui";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { rolLabels } from "@/features/auth/types/auth.types";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { useHistorialEstados, useMiLegajo } from "@/features/legajos/hooks/useLegajos";
import { EmpleadoDetail360 } from "@/features/legajos/components/EmpleadoDetail360";
import { EmpleadoForm } from "@/features/legajos/components/EmpleadoForm";
import { PoliticaPrivacidad } from "../components/PoliticaPrivacidad";

// Perfil propio de cualquier usuario: cuenta de acceso, legajo (si tiene uno
// asociado) y política de privacidad. Se llega tocando el perfil en el aside.
export default function MisDatosPage() {
  const user = useSessionStore((state) => state.user)!;
  const [isEditing, setIsEditing] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const { data: legajo, isLoading, isError } = useMiLegajo();
  const { data: historialEstadosData } = useHistorialEstados(legajo?.id);
  const esOperario = user.rol === "ROLE_OPERARIO";
  const initials =
    `${user.nombre.at(0) ?? ""}${user.apellido.at(0) ?? ""}`.toUpperCase();

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

      {/* ── Cuenta de acceso ───────────────────────────────────── */}
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar className="size-14 text-lg">{initials || "US"}</Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-bold text-foreground">
              {user.nombre} {user.apellido}
            </h2>
            <Badge variant="primary">{rolLabels[user.rol]}</Badge>
          </div>
          <p className="flex items-center gap-1.5 truncate text-sm text-foreground-muted">
            <Mail className="size-4 shrink-0" />
            {user.email}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setChangePasswordOpen(true)}
          className="w-full gap-1.5 sm:w-auto"
        >
          <KeyRound className="size-4" />
          Cambiar contraseña
        </Button>
      </Card>

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
