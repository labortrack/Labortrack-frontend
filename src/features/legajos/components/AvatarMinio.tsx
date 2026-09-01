import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { InitialsAvatar } from "@/shared/components";
import { Skeleton } from "@/shared/ui";
import { useFotoPresignedUrl } from "../hooks/useLegajos";

interface AvatarMinioProps {
  empleadoId: number;
  nombre: string;
  apellido: string;
  fotoPerfilKey?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function AvatarMinio({
  empleadoId,
  nombre,
  apellido,
  fotoPerfilKey,
  className,
  size = "md",
}: AvatarMinioProps) {
  const [imgError, setImgError] = useState(false);
  const fullName = `${nombre} ${apellido}`;

  const { data, isLoading, isError } = useFotoPresignedUrl(
    empleadoId,
    Boolean(fotoPerfilKey && !imgError),
  );

  if (!fotoPerfilKey || imgError || isError) {
    return (
      <InitialsAvatar
        name={fullName}
        size={size}
        className={className}
      />
    );
  }

  if (isLoading || !data) {
    // Definimos el tamaño del Skeleton en base al size de InitialsAvatar o la clase recibida.
    // InitialsAvatar sizes: xs = size-6, sm = size-7, md = size-9, lg = size-11
    const sizeClasses = {
      xs: "size-6",
      sm: "size-7",
      md: "size-9",
      lg: "size-11",
    };
    return (
      <Skeleton
        className={cn(sizeClasses[size], "rounded-full", className)}
      />
    );
  }

  return (
    <img
      src={data.url}
      alt={`Foto de perfil de ${fullName}`}
      className={cn(
        "rounded-full object-cover border border-border shrink-0",
        className,
      )}
      onError={() => setImgError(true)}
    />
  );
}
