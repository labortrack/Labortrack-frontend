import { toast } from "sonner";
import { useObtenerUrlVisor } from "@/features/documentacion/hooks/useDocumentacion";

/**
 * Abre el PDF de un recibo en otra pestaña con la URL firmada de visualizarDocumento.
 * `documentoIdPendiente` indica qué documento se está abriendo, para mostrar el spinner
 * solo en ese botón cuando hay varios en pantalla.
 */
export function useAbrirPdfRecibo() {
  const obtenerUrl = useObtenerUrlVisor();

  const abrir = async (documentoId: number) => {
    // La pestaña se abre en el mismo clic: si se abriera después del await, el navegador
    // la bloquearía como popup.
    const ventana = window.open("", "_blank");
    try {
      const url = await obtenerUrl.mutateAsync(documentoId);
      if (!url) throw new Error("URL vacía");
      if (ventana) {
        ventana.opener = null;
        ventana.location.href = url;
      } else {
        window.open(url, "_blank", "noopener");
      }
    } catch {
      ventana?.close();
      toast.error("No se pudo abrir el PDF del recibo.");
    }
  };

  return {
    abrir,
    documentoIdPendiente: obtenerUrl.isPending ? obtenerUrl.variables : null,
  };
}
