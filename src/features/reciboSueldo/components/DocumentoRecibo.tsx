import { Eye, Printer } from "lucide-react";
import { toast } from "sonner";
import { useVisorPdfRecibo } from "../hooks/useVisorPdfRecibo";
import { useImprimirRecibo } from "../hooks/useRecibosSueldo";
import type { ReciboSueldoDetalleDto } from "../types/reciboSueldo.types";
import { Button, Spinner } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { DocumentoVisorIntegrado } from "@/features/documentacion/components/DocumentoVisorIntegrado";

/**
 * Impresión individual (GENERADO → PENDIENTE_LECTURA) y visor integrado del PDF ya generado.
 * Devuelve null si el recibo no admite ninguna de las dos.
 */
export function DocumentoRecibo({ recibo }: { recibo: ReciboSueldoDetalleDto }) {
  const imprimir = useImprimirRecibo(recibo.id);
  const pdf = useVisorPdfRecibo();

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
  const visorAbierto = pdf.visor != null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {documentoId != null ? (
          <Button
            variant={visorAbierto ? "secondary" : "outline"}
            onClick={() => void pdf.alternar(documentoId)}
            disabled={abriendoPdf}
          >
            {abriendoPdf ? (
              <Spinner />
            ) : (
              <Eye className="mr-1.5 size-4" />
            )}
            {visorAbierto ? "Ocultar PDF" : "Ver PDF"}
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
      {pdf.visor ? (
        <DocumentoVisorIntegrado
          url={pdf.visor.url}
          titulo={`Recibo de sueldo ${recibo.id}`}
          contentType="application/pdf"
          onClose={pdf.cerrar}
        />
      ) : null}
    </div>
  );
}
