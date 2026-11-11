import { useState } from "react";
import { toast } from "sonner";
import { useObtenerUrlVisor } from "@/features/documentacion/hooks/useDocumentacion";

/**
 * Muestra el PDF de un recibo en el visor integrado (igual que Documentación), con la URL
 * firmada de visualizarDocumento. Un solo visor abierto a la vez: abrir otro recibo
 * reemplaza al anterior, y volver a abrir el mismo lo cierra.
 */
export function useVisorPdfRecibo() {
  const obtenerUrl = useObtenerUrlVisor();
  const [visor, setVisor] = useState<{ documentoId: number; url: string } | null>(null);

  const alternar = async (documentoId: number) => {
    if (visor?.documentoId === documentoId) {
      setVisor(null);
      return;
    }
    try {
      const url = await obtenerUrl.mutateAsync(documentoId);
      if (!url) throw new Error("URL vacía");
      setVisor({ documentoId, url });
    } catch {
      toast.error("No se pudo abrir el PDF del recibo.");
    }
  };

  return {
    alternar,
    cerrar: () => setVisor(null),
    visor,
    documentoIdPendiente: obtenerUrl.isPending ? obtenerUrl.variables : null,
  };
}
