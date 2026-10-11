import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { InitialsAvatar } from "@/shared/components";
import { Skeleton } from "@/shared/ui";
import { useFotoPresignedUrl } from "../hooks/useLegajos";

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
  allowZoom?: boolean;
}

export function AvatarMinio({
  empleadoId,
  nombre,
  apellido,
  fotoPerfilKey,
  className,
  size = "md",
  allowZoom = false,
}: AvatarMinioProps) {
  const [urlFallida, setUrlFallida] = useState<string | null>(null);
  const [reintentoHecho, setReintentoHecho] = useState(false);
  const [prevImageUrl, setPrevImageUrl] = useState<string | undefined>(undefined);
  const [isZoomed, setIsZoomed] = useState(false);
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

  if (!fotoPerfilKey || tieneError || isError || (!isLoading && !imageUrl)) {
    return (
      <InitialsAvatar
        name={fullName}
        size={size}
        className={className}
      />
    );
  }

  if (isLoading || !imageUrl) {
    return (
      <Skeleton
        className={cn(sizeClasses[size], "rounded-full shrink-0", className)}
      />
    );
  }

  return (
    <>
      <img
        src={imageUrl}
        alt={`Foto de perfil de ${fullName}`}
        className={cn(
          sizeClasses[size],
          "rounded-full object-cover border border-border shrink-0",
          allowZoom && "cursor-pointer hover:opacity-90 transition-opacity",
          className,
        )}
        onClick={(e) => {
          if (allowZoom) {
            e.stopPropagation();
            setIsZoomed(true);
          }
        }}
        onError={handleImageError}
      />

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(false);
          }}
        >
          <img
            src={imageUrl}
            alt={`Foto de perfil ampliada de ${fullName}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}


