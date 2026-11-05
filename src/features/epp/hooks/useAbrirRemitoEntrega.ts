import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRemitoEntrega } from "../api/epp.api";
import type { RolNombre } from "@/features/auth/types/auth.types";
import { normalizeApiError } from "@/shared/lib/http/apiError";

/** Tiempo que se conserva la URL del blob para que la pestaña termine de cargar el PDF. */
const VIDA_URL_REMITO_MS = 60_000;

/** El backend solo genera remitos para ADMIN y RRHH. */
export function puedeImprimirRemito(rol: RolNombre | undefined): boolean {
  return rol === "ROLE_ADMIN" || rol === "ROLE_RRHH";
}

export function mensajeErrorRemito(error: unknown): string {
  const normalizado = normalizeApiError(
    error,
    "No se pudo generar el remito. Intentá nuevamente.",
  );
  if (normalizado.status === 403) return "No tenés permiso para imprimir remitos.";
  if (normalizado.status === 404) return "No se encontró la entrega.";
  if (normalizado.isNetworkError) return normalizado.message;
  return "No se pudo generar el remito. Intentá nuevamente.";
}

/**
 * Abre el remito PDF de una entrega en otra pestaña. El PDF exige el token de sesión,
 * por eso se descarga como blob con el cliente autenticado en lugar de usar un link directo.
 */
export function useAbrirRemitoEntrega() {
  const descarga = useMutation({ mutationFn: getRemitoEntrega });

  const abrir = async (entregaId: number) => {
    // La pestaña se abre en el mismo clic: si se abriera después del await, el navegador
    // la bloquearía como popup.
    const ventana = window.open("", "_blank");
    try {
      const blob = await descarga.mutateAsync(entregaId);
      const url = URL.createObjectURL(blob);
      if (ventana) {
        ventana.opener = null;
        ventana.location.href = url;
      } else {
        window.open(url, "_blank", "noopener");
      }
      setTimeout(() => URL.revokeObjectURL(url), VIDA_URL_REMITO_MS);
    } catch (error) {
      ventana?.close();
      toast.error(mensajeErrorRemito(error));
    }
  };

  return { abrir, isPending: descarga.isPending };
}
