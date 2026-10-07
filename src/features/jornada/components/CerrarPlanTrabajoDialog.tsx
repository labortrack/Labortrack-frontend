import { useState } from "react";
import { AlertCircle, CalendarX2, MessageSquare, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/shared/components";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
  Textarea,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useCerrarPlanTrabajo } from "../hooks/usePlanesTrabajo";
import type { PlanTrabajoDetalleResponseDto } from "../types/planTrabajo.types";

interface CerrarPlanTrabajoDialogProps {
  plan: PlanTrabajoDetalleResponseDto;
  accion: "cancelar" | "finalizar";
  onClose: () => void;
}

const config = {
  cancelar: {
    titulo: "Cancelar plan de trabajo",
    descripcion:
      "El plan conservará su período original para auditoría. Sus jornadas programadas y las asistencias esperadas pendientes quedarán anuladas.",
    confirmacion: "Confirmar cancelación",
    procesando: "Cancelando...",
    exito: "Plan de trabajo cancelado correctamente.",
  },
  finalizar: {
    titulo: "Finalizar plan anticipadamente",
    descripcion:
      "El sistema conservará la actividad ya registrada. Si hoy no hubo actividad, la vigencia terminará ayer; si la hubo o la jornada fue resuelta como no trabajada, terminará hoy.",
    confirmacion: "Confirmar finalización",
    procesando: "Finalizando...",
    exito: "Plan de trabajo finalizado anticipadamente.",
  },
} as const;

export function CerrarPlanTrabajoDialog({
  plan,
  accion,
  onClose,
}: CerrarPlanTrabajoDialogProps) {
  const mutation = useCerrarPlanTrabajo(plan.cuadrillaId, plan.id, accion);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState<string>();
  const [errorEnvio, setErrorEnvio] = useState<string>();
  const contenido = config[accion];

  const handleOpenChange = (open: boolean) => {
    if (!open && !mutation.isPending) onClose();
  };

  const confirmar = async () => {
    if (mutation.isPending) return;
    const motivoNormalizado = motivo.trim();
    if (!motivoNormalizado) {
      setErrorMotivo("Ingresá el motivo de la operación.");
      return;
    }
    if (motivoNormalizado.length > 500) {
      setErrorMotivo("El motivo no puede superar los 500 caracteres.");
      return;
    }

    setErrorMotivo(undefined);
    setErrorEnvio(undefined);
    try {
      await mutation.mutateAsync({ motivo: motivoNormalizado });
      toast.success(contenido.exito);
      onClose();
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "No se pudo completar la operación sobre el plan.",
      );
      setErrorEnvio(
        apiError.status === 409
          ? `${apiError.message} Actualizá el detalle e intentá nuevamente.`
          : apiError.message,
      );
    }
  };

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl" aria-busy={mutation.isPending}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-error-soft text-error">
              <CalendarX2 className="size-5" />
            </span>
            <div>
              <DialogTitle>{contenido.titulo}</DialogTitle>
              <DialogDescription>{contenido.descripcion}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Alert variant="warning">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            Esta operación no puede revertirse. Para volver a planificar la
            cuadrilla será necesario crear un nuevo plan.
          </span>
        </Alert>

        {errorEnvio ? (
          <Alert variant="error" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{errorEnvio}</span>
          </Alert>
        ) : null}

        <FormField
          id="motivo-cierre-plan"
          label="Motivo"
          icon={MessageSquare}
          required
          error={errorMotivo}
          hint={`${motivo.length}/500 caracteres`}
        >
          <Textarea
            id="motivo-cierre-plan"
            autoFocus
            rows={4}
            maxLength={500}
            disabled={mutation.isPending}
            placeholder="Explicá por qué se debe realizar esta operación."
            value={motivo}
            onChange={(event) => {
              setMotivo(event.target.value);
              setErrorMotivo(undefined);
            }}
            aria-invalid={Boolean(errorMotivo)}
            aria-describedby={
              errorMotivo
                ? "motivo-cierre-plan-error"
                : "motivo-cierre-plan-hint"
            }
          />
        </FormField>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={mutation.isPending}
            onClick={onClose}
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => void confirmar()}
          >
            {mutation.isPending ? (
              <>
                <Spinner className="text-white" />
                {contenido.procesando}
              </>
            ) : (
              contenido.confirmacion
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
