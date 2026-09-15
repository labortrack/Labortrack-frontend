import { useState } from "react";
import { InitialsAvatar } from "@/shared/components";
import { cn } from "@/shared/utils/cn";

interface TrabajadorAvatarProps {
  nombre: string;
  fotoUrl: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const imageSizes = {
  sm: "size-7",
  md: "size-9",
  lg: "size-14",
} as const;

export function TrabajadorAvatar({
  nombre,
  fotoUrl,
  size = "md",
  className,
}: TrabajadorAvatarProps) {
  const [imagenInvalida, setImagenInvalida] = useState(false);

  if (!fotoUrl || imagenInvalida) {
    return (
      <InitialsAvatar
        name={nombre}
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"}
        className={cn(size === "lg" && "size-14", className)}
      />
    );
  }

  return (
    <img
      src={fotoUrl}
      alt={`Foto de ${nombre}`}
      className={cn(
        imageSizes[size],
        "shrink-0 rounded-full border border-border object-cover",
        className,
      )}
      onError={() => setImagenInvalida(true)}
    />
  );
}
