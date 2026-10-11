import { useState } from "react";
import { toast } from "sonner";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useActualizarFotoPerfil } from "./useLegajos";
import { validarFotoPerfil } from "../utils/validarFotoPerfil";

export function useSubirFotoPerfil(legajoId?: number | null) {
  const actualizarFotoMutation = useActualizarFotoPerfil();
  const [isUploading, setIsUploading] = useState(false);

  const subirFoto = async (file: File): Promise<boolean> => {
    if (!legajoId) return false;

    const errorValidacion = validarFotoPerfil(file);
    if (errorValidacion) {
      toast.error(errorValidacion);
      return false;
    }

    setIsUploading(true);
    try {
      await actualizarFotoMutation.mutateAsync({
        id: legajoId,
        foto: file,
      });
      toast.success("Foto de perfil actualizada exitosamente.");
      return true;
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo actualizar la foto de perfil.").message,
      );
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    subirFoto,
    isSubiendo: isUploading || actualizarFotoMutation.isPending,
  };
}
