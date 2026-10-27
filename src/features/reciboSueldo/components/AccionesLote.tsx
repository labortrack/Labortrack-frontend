import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  useEmitirLote,
  useImprimirLote,
  useRecibosDelPeriodo,
} from "../hooks/useRecibosSueldo";
import type { ResultadoImpresionLote } from "../types/reciboSueldo.types";
import type { PeriodoLiquidacionResponseDto } from "@/features/periodoLiquidacion/types/periodoLiquidacion.types";
import { ConfirmDialog, InitialsAvatar } from "@/shared/components";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

// ─── Emitir lote (PRE_LIQUIDADO) ────────────────────────────────────────────

export function EmitirLote({
  periodo,
}: {
  periodo: PeriodoLiquidacionResponseDto;
}) {
  const recibosQuery = useRecibosDelPeriodo(periodo.id);
  const mutation = useEmitirLote();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const recibos = recibosQuery.data ?? [];
  const borradores = recibos.filter((r) => r.estado === "BORRADOR").length;
  const cancelados = recibos.filter((r) => r.estado === "CANCELADO").length;

  const cerrar = () => {
    if (mutation.isPending) return;
    setConfirmOpen(false);
    setSubmitError(undefined);
    mutation.reset();
  };

  const handleConfirm = async () => {
    setSubmitError(undefined);
    try {
      const resultado = await mutation.mutateAsync(periodo.id);
      toast.success("Lote emitido.", {
        description: `Se emitieron ${resultado.recibosEmitidos} recibos y el período quedó cerrado.`,
      });
      setConfirmOpen(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo emitir el lote.").message,
      );
    }
  };

  return (
    <>
      <Button
        onClick={() => setConfirmOpen(true)}
        disabled={recibosQuery.isPending}
        className="w-full sm:w-auto justify-center"
      >
        <Send className="mr-1.5 size-4" />
        Emitir lote
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Emitir el lote de recibos?"
        description={`${borradores === 1 ? "El recibo en borrador" : `Los ${borradores} recibos en borrador`} de "${periodo.descripcionPeriodoLiquidacion}" ${borradores === 1 ? "pasa" : "pasan"} a Generado y el período se cierra. Después de emitir ya no se pueden ajustar, regenerar ni cancelar, y no se pueden agregar los empleados que hayan quedado omitidos.`}
        confirmLabel="Emitir lote"
        pending={mutation.isPending}
        onOpenChange={(open) => {
          if (!open) cerrar();
        }}
        onConfirm={handleConfirm}
      >
        {cancelados > 0 ? (
          <Alert className="mb-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {cancelados === 1
              ? "El recibo cancelado queda como está."
              : `Los ${cancelados} recibos cancelados quedan como están.`}
          </Alert>
        ) : null}
        {borradores === 0 ? (
          <Alert variant="warning" className="mb-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            No hay recibos en borrador: el período se cerrará sin emitir
            ninguno.
          </Alert>
        ) : null}
        {submitError ? (
          <Alert variant="error" className="mb-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {submitError}
          </Alert>
        ) : null}
      </ConfirmDialog>
    </>
  );
}

// ─── Imprimir lote (CERRADO) ────────────────────────────────────────────────

export function ImprimirLote({
  periodo,
}: {
  periodo: PeriodoLiquidacionResponseDto;
}) {
  const recibosQuery = useRecibosDelPeriodo(periodo.id);
  const mutation = useImprimirLote();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [resultado, setResultado] = useState<ResultadoImpresionLote | null>(
    null,
  );

  // Solo se imprimen los GENERADO: los ya impresos y los cancelados quedan afuera solos,
  // por eso reintentar el lote es seguro.
  const generados = (recibosQuery.data ?? []).filter(
    (r) => r.estado === "GENERADO",
  ).length;

  const cerrar = () => {
    if (mutation.isPending) return;
    setConfirmOpen(false);
    setSubmitError(undefined);
    mutation.reset();
  };

  const handleConfirm = async () => {
    setSubmitError(undefined);
    try {
      const respuesta = await mutation.mutateAsync(periodo.id);
      setConfirmOpen(false);
      if (respuesta.noImpresos.length > 0) {
        setResultado(respuesta);
      } else {
        toast.success("Lote impreso.", {
          description: `Se generaron ${respuesta.recibosImpresos} PDF y los recibos quedaron pendientes de lectura.`,
        });
      }
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo imprimir el lote.").message,
      );
    }
  };

  if (!recibosQuery.isPending && generados === 0) return null;

  return (
    <>
      <Button
        onClick={() => setConfirmOpen(true)}
        disabled={recibosQuery.isPending}
        className="w-full sm:w-auto justify-center"
      >
        <Printer className="mr-1.5 size-4" />
        Imprimir lote ({generados})
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Imprimir el lote de recibos?"
        description={
          generados === 1
            ? `Se generará el PDF del recibo generado de "${periodo.descripcionPeriodoLiquidacion}", se vinculará al legajo del empleado y el recibo quedará pendiente de lectura. Puede tardar unos segundos.`
            : `Se generará el PDF de los ${generados} recibos generados de "${periodo.descripcionPeriodoLiquidacion}", se vinculará al legajo de cada empleado y los recibos quedarán pendientes de lectura. Puede tardar unos segundos.`
        }
        confirmLabel="Imprimir"
        pending={mutation.isPending}
        onOpenChange={(open) => {
          if (!open) cerrar();
        }}
        onConfirm={handleConfirm}
      >
        {submitError ? (
          <Alert variant="error" className="mb-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {submitError}
          </Alert>
        ) : null}
      </ConfirmDialog>

      <ResultadoImpresionDialog
        resultado={resultado}
        onClose={() => setResultado(null)}
      />
    </>
  );
}

function ResultadoImpresionDialog({
  resultado,
  onClose,
}: {
  resultado: ResultadoImpresionLote | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(resultado)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-warning-soft text-warning">
              <Printer className="size-5" />
            </span>
            <div>
              <DialogTitle>Impresión con errores</DialogTitle>
              <DialogDescription>{resultado?.descripcionPeriodo}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-success" />
            Se imprimieron {resultado?.recibosImpresos ?? 0} recibos.
          </p>
          <Alert variant="warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Estos recibos no se pudieron imprimir y siguen en estado Generado.
            Podés reintentar el lote: los ya impresos no se repiten.
          </Alert>
          <ul className="max-h-60 divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {resultado?.noImpresos.map((recibo) => (
              <li
                key={recibo.reciboSueldoId}
                className="flex items-start gap-2.5 p-3 text-sm"
              >
                <InitialsAvatar name={recibo.apellidoNombre} />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {recibo.apellidoNombre}
                  </p>
                  <p className="mt-0.5 text-foreground-muted">{recibo.motivo}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
