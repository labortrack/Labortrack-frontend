import { useState } from "react";
import { AlertCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ResultadoPreLiquidacionDialog } from "./ResultadoPreLiquidacionDialog";
import { useCompletarPreLiquidacion } from "../hooks/useRecibosSueldo";
import type { ResultadoPreLiquidacion } from "../types/reciboSueldo.types";
import type { PeriodoLiquidacionResponseDto } from "@/features/periodoLiquidacion/types/periodoLiquidacion.types";
import { ConfirmDialog } from "@/shared/components";
import { Alert, Button } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

/**
 * Genera los recibos de los empleados que quedaron omitidos en la pre-liquidación, una vez
 * corregido el motivo (por ejemplo, la categoría UOCRA que les faltaba).
 */
export function CompletarPreLiquidacion({
  periodo,
}: {
  periodo: PeriodoLiquidacionResponseDto;
}) {
  const mutation = useCompletarPreLiquidacion();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [resultado, setResultado] = useState<ResultadoPreLiquidacion | null>(
    null,
  );

  const cerrarConfirmacion = () => {
    setConfirmOpen(false);
    setSubmitError(undefined);
    mutation.reset();
  };

  const handleConfirm = async () => {
    setSubmitError(undefined);
    try {
      const respuesta = await mutation.mutateAsync(periodo.id);
      if (respuesta.empleadosEvaluados === 0) {
        toast.success("No faltan recibos.", {
          description: "Todos los empleados con asistencias en el período ya tienen su recibo.",
        });
      } else {
        setResultado(respuesta);
      }
      cerrarConfirmacion();
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo completar la pre-liquidación.")
          .message,
      );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        className="w-full sm:w-auto justify-center"
      >
        <UserPlus className="mr-1.5 size-4" />
        Completar pre-liquidación
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Completar la pre-liquidación?"
        description="Se generarán los recibos de los empleados con asistencias en el período que todavía no tienen uno, por ejemplo los que quedaron omitidos por falta de categoría. Los recibos existentes, incluso los cancelados, no se modifican."
        confirmLabel="Completar"
        pending={mutation.isPending}
        onOpenChange={(open) => {
          if (!open && !mutation.isPending) cerrarConfirmacion();
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

      <ResultadoPreLiquidacionDialog
        resultado={resultado}
        onClose={() => setResultado(null)}
      />
    </>
  );
}
