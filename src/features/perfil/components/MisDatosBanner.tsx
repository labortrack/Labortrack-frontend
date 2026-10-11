import { useRef } from "react";
import { Building2, Camera, Mail } from "lucide-react";
import type { CurrentUser } from "@/features/auth/types/auth.types";
import { rolLabels } from "@/features/auth/types/auth.types";
import type { EmpleadoResponseDto } from "@/features/legajos/types/legajo.types";
import { ESTADO_LABELS } from "@/features/legajos/types/legajo.types";
import { AvatarMinio } from "@/features/legajos/components/AvatarMinio";
import { useSubirFotoPerfil } from "@/features/legajos/hooks/useSubirFotoPerfil";
import { Avatar, Badge, Card, Skeleton, Spinner } from "@/shared/ui";

interface MisDatosBannerProps {
  user: CurrentUser;
  legajo?: EmpleadoResponseDto;
  isLoadingLegajo?: boolean;
  nombreEmpresa?: string;
}

export function MisDatosBanner({
  user,
  legajo,
  isLoadingLegajo = false,
  nombreEmpresa,
}: MisDatosBannerProps) {
  const nombreCompleto = `${user.nombre} ${user.apellido}`;
  const initials =
    `${user.nombre.at(0) ?? ""}${user.apellido.at(0) ?? ""}`.toUpperCase();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { subirFoto, isSubiendo } = useSubirFotoPerfil(legajo?.id);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await subirFoto(file);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-primary to-primary/70" />
      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
        <div className="relative -mt-10 size-20 shrink-0">
          {legajo?.id ? (
            <AvatarMinio
              empleadoId={legajo.id}
              nombre={user.nombre}
              apellido={user.apellido}
              fotoPerfilKey={legajo.fotoPerfilKey}
              size="lg"
              className="size-20 border-4 border-card text-2xl shadow-soft"
            />
          ) : (
            <Avatar className="size-20 border-4 border-card text-2xl shadow-soft">
              {initials || "US"}
            </Avatar>
          )}

          {/* Spinner superpuesto durante la subida */}
          {isSubiendo && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-black/60 text-white">
              <Spinner className="size-6 text-white" />
            </div>
          )}

          {/* Botón de cámara accesible (>= 44px) siempre visible solo con legajo */}
          {!isLoadingLegajo && legajo?.id ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubiendo}
                aria-label="Cambiar foto de perfil"
                className="absolute -bottom-1 -right-1 z-20 flex size-11 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <Camera className="size-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-bold text-foreground">
              {nombreCompleto}
            </h2>
            <Badge variant="primary">{rolLabels[user.rol]}</Badge>
            {isLoadingLegajo ? (
              <Skeleton className="h-5 w-20 rounded-full" />
            ) : legajo?.estadoActual ? (
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
            ) : null}
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
