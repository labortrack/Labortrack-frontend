import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { InitialsAvatar } from "@/shared/components";
import { Skeleton } from "@/shared/ui";
import { useFotoPresignedUrl } from "../hooks/useLegajos";
import { FotoPerfilDialog } from "./FotoPerfilDialog";

const sizeClasses = {
  xs: "size-6",
  sm: "size-7",
  md: "size-9",
  lg: "size-11",
};

interface AvatarMinioProps {
  empleadoId: number;
  nombre: string;
  apellido: string;
  fotoPerfilKey?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  ampliable?: boolean;
  /** @deprecated Usar `ampliable` */
  allowZoom?: boolean;
}

export function AvatarMinio({
  empleadoId,
  nombre,
  apellido,
  fotoPerfilKey,
  className,
  size = "md",
  ampliable = false,
  allowZoom,
}: AvatarMinioProps) {
  const esAmpliable = ampliable || Boolean(allowZoom);
  const [urlFallida, setUrlFallida] = useState<string | null>(null);
  const [reintentoHecho, setReintentoHecho] = useState(false);
  const [prevImageUrl, setPrevImageUrl] = useState<string | undefined>(undefined);
  const [visorAbierto, setVisorAbierto] = useState(false);
  const fullName = `${nombre} ${apellido}`;

  const { data, isLoading, isError, refetch } = useFotoPresignedUrl(
    empleadoId,
    Boolean(fotoPerfilKey),
  );

  const imageUrl = typeof data === "string" ? data : data?.url;

  // Limpiar error y contador de reintentos únicamente al cambiar la URL resuelta
  if (imageUrl !== prevImageUrl) {
    setPrevImageUrl(imageUrl);
    setUrlFallida(null);
    setReintentoHecho(false);
  }

  const tieneError = Boolean(imageUrl && urlFallida === imageUrl);

  const handleImageError = () => {
    if (!imageUrl) return;

    if (!reintentoHecho) {
      // Reintentar UNA sola vez solicitando una nueva URL firmada (por si había expirado)
      setReintentoHecho(true);
      void refetch();
    } else {
      // Si ya se reintentó y persiste el fallo, marcar error definitivo para esta URL y mostrar iniciales
      setUrlFallida(imageUrl);
    }
  };

  const handleRetryManual = () => {
    setUrlFallida(null);
    setReintentoHecho(false);
    void refetch();
  };

  if (!fotoPerfilKey || tieneError || isError || (!isLoading && !imageUrl)) {
    return (
      <>
        <InitialsAvatar
          name={fullName}
          size={size}
          className={className}
        />
        {esAmpliable && visorAbierto && (
          <FotoPerfilDialog
            open={visorAbierto}
            onOpenChange={setVisorAbierto}
            imageUrl={imageUrl}
            nombre={fullName}
            tieneError={tieneError || isError || !imageUrl}
            onError={handleImageError}
            onRetryManual={handleRetryManual}
          />
        )}
      </>
    );
  }

  if (isLoading || !imageUrl) {
    return (
      <Skeleton
        className={cn(sizeClasses[size], "aspect-square rounded-full shrink-0", className)}
      />
    );
  }

  if (esAmpliable) {
    return (
      <>
        <button
          type="button"
          onClick={() => setVisorAbierto(true)}
          aria-label={`Ver foto de perfil de ${fullName}`}
          className={cn(
            "group inline-flex aspect-square shrink-0 items-center justify-center rounded-full border border-border bg-transparent p-0 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            sizeClasses[size],
            className,
          )}
        >
          <img
            src={imageUrl}
            alt={`Foto de perfil de ${fullName}`}
            className="size-full aspect-square rounded-full object-cover transition-opacity group-hover:opacity-90"
            onError={handleImageError}
          />
        </button>
        <FotoPerfilDialog
          open={visorAbierto}
          onOpenChange={setVisorAbierto}
          imageUrl={imageUrl}
          nombre={fullName}
          tieneError={tieneError}
          onError={handleImageError}
          onRetryManual={handleRetryManual}
        />
      </>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Foto de perfil de ${fullName}`}
      className={cn(
        sizeClasses[size],
        "aspect-square rounded-full object-cover border border-border shrink-0",
        className,
      )}
      onError={handleImageError}
    />
  );
}


