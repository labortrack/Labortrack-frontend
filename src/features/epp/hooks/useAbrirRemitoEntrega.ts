import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRemitoPdf } from "../api/epp.api";
import { eppKeys } from "./useEpp";
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
  if (normalizado.status === 403) return "No tenés permiso para ver este remito.";
  if (normalizado.status === 404) return "No se encontró el remito.";
  if (normalizado.isNetworkError) return normalizado.message;
  return "No se pudo generar el remito. Intentá nuevamente.";
}

/**
 * Abre el PDF de un remito en otra pestaña. El PDF exige el token de sesión,
 * por eso se descarga como blob con el cliente autenticado en lugar de usar un link directo.
 */
export function useAbrirRemitoEntrega() {
  const queryClient = useQueryClient();
  const descarga = useMutation({
    mutationFn: getRemitoPdf,
    // La primera apertura genera y guarda el PDF: se refrescan las listas para que pdfGenerado
    // deje de ser false.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eppKeys.remitos() }),
  });

  const abrir = async (remitoId: number) => {
    // La pestaña se abre en el mismo clic: si se abriera después del await, el navegador
    // la bloquearía como popup.
    const ventana = window.open("", "_blank");
    try {
      const blob = await descarga.mutateAsync(remitoId);
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
