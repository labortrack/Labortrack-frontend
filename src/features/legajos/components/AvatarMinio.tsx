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
  const [imgError, setImgError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const fullName = `${nombre} ${apellido}`;

  const { data, isLoading, isError } = useFotoPresignedUrl(
    empleadoId,
    Boolean(fotoPerfilKey && !imgError),
  );

  const imageUrl = typeof data === "string" ? data : data?.url;

  if (!fotoPerfilKey || imgError || isError || (!isLoading && !imageUrl)) {
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
        onError={() => setImgError(true)}
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


