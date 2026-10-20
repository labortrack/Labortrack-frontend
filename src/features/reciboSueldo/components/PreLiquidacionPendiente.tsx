import { useState } from "react";
import { AlertCircle, CalendarClock, Hourglass, Play } from "lucide-react";
import { toast } from "sonner";
import { useEjecutarPreLiquidacion } from "../hooks/useRecibosSueldo";
import type { ResultadoPreLiquidacion } from "../types/reciboSueldo.types";
import type { PeriodoLiquidacionResponseDto } from "@/features/periodoLiquidacion/types/periodoLiquidacion.types";
import {
  formatFecha,
  formatFechaHora,
  periodoYaCerro,
  primerDiaEjecucion,
} from "@/features/periodoLiquidacion/utils/periodoLiquidacion";
import { ConfirmDialog } from "@/shared/components";
import { Alert, Button, Card } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

/**
 * Estado vacío de un período PENDIENTE: todavía no tiene recibos. El resultado de la ejecución
 * lo muestra el padre, porque al pre-liquidar el período deja de estar PENDIENTE y este
 * componente se desmonta.
 */
export function PreLiquidacionPendiente({
  periodo,
  onEjecutada,
}: {
  periodo: PeriodoLiquidacionResponseDto;
  onEjecutada: (resultado: ResultadoPreLiquidacion) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const cerrado = periodoYaCerro(periodo);

  return (
    <>
      <Card className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-warning-soft">
          {cerrado ? (
            <CalendarClock className="size-5 text-warning" />
          ) : (
            <Hourglass className="size-5 text-warning" />
          )}
        </span>
        <div className="max-w-md space-y-1">
          <h3 className="font-semibold text-foreground">
            Este período todavía no se pre-liquidó
          </h3>
          <p className="text-sm text-foreground-muted">
            {cerrado
              ? `La generación automática de recibos está programada para el ${formatFechaHora(periodo.fechaEjecucionPreLiquidacion)} hs. Como el período ya cerró, podés ejecutarla ahora.`
              : `El período termina el ${formatFecha(periodo.fechaHasta)}: se podrá pre-liquidar a partir del ${formatFecha(primerDiaEjecucion(periodo.fechaHasta))}. La generación automática está programada para el ${formatFechaHora(periodo.fechaEjecucionPreLiquidacion)} hs.`}
          </p>
        </div>
        {cerrado ? (
          <Button onClick={() => setConfirmOpen(true)}>
            <Play className="mr-1.5 size-4" />
            Ejecutar pre-liquidación ahora
          </Button>
        ) : null}
      </Card>

      {confirmOpen ? (
        <EjecutarPreLiquidacionDialog
          periodo={periodo}
          onClose={() => setConfirmOpen(false)}
          onEjecutada={onEjecutada}
        />
      ) : null}
    </>
  );
}

function EjecutarPreLiquidacionDialog({
  periodo,
  onClose,
  onEjecutada,
}: {
  periodo: PeriodoLiquidacionResponseDto;
  onClose: () => void;
  onEjecutada: (resultado: ResultadoPreLiquidacion) => void;
}) {
  const mutation = useEjecutarPreLiquidacion();
  const [submitError, setSubmitError] = useState<string>();

  const handleConfirm = async () => {
    setSubmitError(undefined);
    try {
      const resultado = await mutation.mutateAsync(periodo.id);
      toast.success("Pre-liquidación ejecutada.", {
        description: `Se generaron ${resultado.recibosGenerados} recibos en borrador.`,
      });
      onClose();
      onEjecutada(resultado);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo ejecutar la pre-liquidación.")
          .message,
      );
    }
  };

  return (
    <ConfirmDialog
      open
      title="¿Ejecutar la pre-liquidación ahora?"
      description={`Se generarán los recibos en borrador de "${periodo.descripcionPeriodoLiquidacion}" (${formatFecha(periodo.fechaDesde)} al ${formatFecha(periodo.fechaHasta)}) para todos los empleados con asistencias en el período, y ya no se ejecutará de forma automática.`}
      confirmLabel="Ejecutar"
      pending={mutation.isPending}
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
      onConfirm={handleConfirm}
    >
      {submitError ? (
        <Alert variant="error" className="mb-2">
          <AlertCircle className="mt-0.5 size-4" />
          {submitError}
        </Alert>
      ) : null}
    </ConfirmDialog>
  );
}
