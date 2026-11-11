import { useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useVisorPdfRecibo } from "../hooks/useVisorPdfRecibo";
import { useConfirmarLectura, useMisRecibos } from "../hooks/useRecibosSueldo";
import type { ReciboSueldoPropioDto } from "../types/reciboSueldo.types";
import {
  ESTADO_RECIBO_BADGE_VARIANT,
  ESTADO_RECIBO_LABELS,
} from "../utils/reciboSueldo";
import {
  formatFecha,
  formatFechaHora,
} from "@/features/periodoLiquidacion/utils/periodoLiquidacion";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components";
import { Badge, Button, Card, CardContent, Spinner } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { formatCurrency } from "@/shared/utils/currency";
import { cn } from "@/shared/utils/cn";
import { DocumentoVisorIntegrado } from "@/features/documentacion/components/DocumentoVisorIntegrado";

/**
 * Autogestión del empleado (RF058-RF060, CU36, CU40): sus recibos publicados, el PDF y la
 * confirmación de lectura. Abrir el PDF no cuenta como leído: la confirmación es explícita.
 * Los pendientes anteriores no bloquean nada (RF060).
 */
export function MisRecibos() {
  const query = useMisRecibos();
  const pdf = useVisorPdfRecibo();
  const confirmar = useConfirmarLectura();
  const [aConfirmar, setAConfirmar] = useState<ReciboSueldoPropioDto | null>(null);

  if (query.isPending) {
    return <LoadingState label="Cargando tus recibos..." />;
  }
  if (query.isError) {
    return (
      <ErrorState
        message={
          normalizeApiError(query.error, "No se pudieron cargar tus recibos.").message
        }
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (query.data.length === 0) {
    return (
      <EmptyState
        title="Todavía no tenés recibos"
        description="Cuando se publique un recibo de sueldo tuyo, te va a llegar una notificación y lo vas a ver acá."
      />
    );
  }

  const handleConfirmar = async () => {
    if (!aConfirmar) return;
    try {
      await confirmar.mutateAsync(aConfirmar.id);
      toast.success("Lectura confirmada.");
      setAConfirmar(null);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo confirmar la lectura del recibo.").message,
      );
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {query.data.map((recibo) => {
          const documentoId = recibo.documentoId;
          const abriendo = documentoId != null && pdf.documentoIdPendiente === documentoId;
          const visor = documentoId != null && pdf.visor?.documentoId === documentoId ? pdf.visor : null;
          return (
            // Con el visor abierto la tarjeta ocupa toda la fila para que el PDF sea legible.
            <Card key={recibo.id} className={cn(visor && "md:col-span-2 xl:col-span-3")}>
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {recibo.descripcionPeriodo}
                    </h3>
                    <p className="mt-0.5 text-xs text-foreground-muted">
                      {formatFecha(recibo.fechaDesde)} al {formatFecha(recibo.fechaHasta)}
                    </p>
                  </div>
                  <Badge variant={ESTADO_RECIBO_BADGE_VARIANT[recibo.estado]}>
                    {ESTADO_RECIBO_LABELS[recibo.estado]}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-foreground-muted">Neto a cobrar</p>
                  <p className="text-xl font-semibold tabular-nums text-foreground">
                    {formatCurrency(recibo.totalNeto)}
                  </p>
                </div>

                {recibo.fechaHoraLectura ? (
                  <p className="text-xs text-foreground-muted">
                    Lectura confirmada el {formatFechaHora(recibo.fechaHoraLectura)} hs
                  </p>
                ) : null}

                <div className={cn("mt-auto flex flex-col gap-2 sm:flex-row", visor && "sm:justify-end")}>
                  {documentoId != null ? (
                    <Button
                      variant={visor ? "secondary" : "outline"}
                      className={cn(!visor && "flex-1")}
                      onClick={() => void pdf.alternar(documentoId)}
                      disabled={abriendo}
                    >
                      {abriendo ? <Spinner /> : <Eye className="mr-1.5 size-4" />}
                      {visor ? "Ocultar PDF" : "Ver PDF"}
                    </Button>
                  ) : null}
                  {recibo.estado === "PENDIENTE_LECTURA" ? (
                    <Button className={cn(!visor && "flex-1")} onClick={() => setAConfirmar(recibo)}>
                      <CheckCircle2 className="mr-1.5 size-4" />
                      Confirmar lectura
                    </Button>
                  ) : null}
                </div>

                {visor ? (
                  <DocumentoVisorIntegrado
                    url={visor.url}
                    titulo={`Recibo ${recibo.descripcionPeriodo}`}
                    contentType="application/pdf"
                    onClose={pdf.cerrar}
                  />
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={aConfirmar != null}
        title="Confirmar lectura"
        description={
          aConfirmar
            ? `¿Confirmás que leíste tu recibo de ${aConfirmar.descripcionPeriodo}? Queda registrado con la fecha y la hora de hoy, y no se puede deshacer.`
            : ""
        }
        confirmLabel="Confirmar lectura"
        pending={confirmar.isPending}
        onOpenChange={(open) => {
          if (!open) setAConfirmar(null);
        }}
        onConfirm={() => void handleConfirmar()}
      />
    </>
  );
}
