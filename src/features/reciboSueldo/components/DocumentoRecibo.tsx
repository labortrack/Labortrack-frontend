import { FileDown, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAbrirPdfRecibo } from "../hooks/useAbrirPdfRecibo";
import { useImprimirRecibo } from "../hooks/useRecibosSueldo";
import type { ReciboSueldoDetalleDto } from "../types/reciboSueldo.types";
import { Button, Spinner } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

/**
 * Impresión individual (GENERADO → PENDIENTE_LECTURA) y acceso al PDF ya generado.
 * Devuelve null si el recibo no admite ninguna de las dos.
 */
export function DocumentoRecibo({ recibo }: { recibo: ReciboSueldoDetalleDto }) {
  const imprimir = useImprimirRecibo(recibo.id);
  const pdf = useAbrirPdfRecibo();

  const puedeImprimir = recibo.estado === "GENERADO";
  const documentoId = recibo.documentoId;
  if (!puedeImprimir && documentoId == null) return null;

  const handleImprimir = async () => {
    try {
      await imprimir.mutateAsync(undefined);
      toast.success("Recibo impreso.", {
        description: "El PDF quedó vinculado al legajo y el recibo pendiente de lectura.",
      });
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo imprimir el recibo.").message,
      );
    }
  };

  const abriendoPdf = pdf.documentoIdPendiente != null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
      {documentoId != null ? (
        <Button
          variant="outline"
          onClick={() => void pdf.abrir(documentoId)}
          disabled={abriendoPdf}
        >
          {abriendoPdf ? (
            <Spinner />
          ) : (
            <FileDown className="mr-1.5 size-4" />
          )}
          Ver PDF
        </Button>
      ) : null}
      {puedeImprimir ? (
        <Button onClick={() => void handleImprimir()} disabled={imprimir.isPending}>
          {imprimir.isPending ? (
            <>
              <Spinner className="text-white" />
              Imprimiendo...
            </>
          ) : (
            <>
              <Printer className="mr-1.5 size-4" />
              Imprimir recibo
            </>
          )}
        </Button>
      ) : null}
    </div>
  );
}
