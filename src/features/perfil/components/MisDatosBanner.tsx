import { Building2, Mail } from "lucide-react";
import type { CurrentUser } from "@/features/auth/types/auth.types";
import { rolLabels } from "@/features/auth/types/auth.types";
import type { EmpleadoResponseDto } from "@/features/legajos/types/legajo.types";
import { AvatarMinio } from "@/features/legajos/components/AvatarMinio";
import { Avatar, Badge, Card } from "@/shared/ui";

interface MisDatosBannerProps {
  user: CurrentUser;
  legajo?: EmpleadoResponseDto;
  nombreEmpresa?: string;
}

export function MisDatosBanner({
  user,
  legajo,
  nombreEmpresa,
}: MisDatosBannerProps) {
  const nombreCompleto = `${user.nombre} ${user.apellido}`;
  const initials =
    `${user.nombre.at(0) ?? ""}${user.apellido.at(0) ?? ""}`.toUpperCase();

  return (
    <Card className="overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-primary to-primary/70" />
      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
        {legajo?.id ? (
          <AvatarMinio
            empleadoId={legajo.id}
            nombre={user.nombre}
            apellido={user.apellido}
            fotoPerfilKey={legajo.fotoPerfilKey}
            size="lg"
            className="-mt-10 size-20 border-4 border-card text-2xl shadow-soft shrink-0"
          />
        ) : (
          <Avatar className="-mt-10 size-20 border-4 border-card text-2xl shadow-soft shrink-0">
            {initials || "US"}
          </Avatar>
        )}

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
  );
}
