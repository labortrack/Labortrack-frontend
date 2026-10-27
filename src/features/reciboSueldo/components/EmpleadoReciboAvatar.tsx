import { AvatarMinio } from "@/features/legajos/components/AvatarMinio";

/**
 * Avatar del empleado de un recibo. El backend manda el nombre como "Apellido, Nombre";
 * AvatarMinio los espera por separado para armar las iniciales y el texto alternativo.
 */
export function EmpleadoReciboAvatar({
  empleadoId,
  apellidoNombre,
  fotoPerfilKey,
  size = "sm",
}: {
  empleadoId: number;
  apellidoNombre: string;
  fotoPerfilKey: string | null;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const [apellido, nombre = ""] = apellidoNombre.split(",").map((p) => p.trim());

  return (
    <AvatarMinio
      empleadoId={empleadoId}
      nombre={nombre}
      apellido={apellido}
      fotoPerfilKey={fotoPerfilKey}
      size={size}
    />
  );
}
