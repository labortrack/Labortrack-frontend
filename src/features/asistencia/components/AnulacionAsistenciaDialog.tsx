import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CircleX, TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAnularAsistencia } from "../hooks/useAsistencias";
import {
  anulacionAsistenciaSchema,
  type AnulacionAsistenciaForm,
} from "../schemas/anulacionRegistroSchema";
import type { AsistenciaOperativaDetalleResponseDto } from "../types/asistencia.types";
import { formatHora } from "../utils/asistenciaFormatters";
import { ResumenOperacionAsistencia } from "./ResumenOperacionAsistencia";
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

interface AnulacionAsistenciaDialogProps {
  open: boolean;
  asistencia: AsistenciaOperativaDetalleResponseDto;
  onOpenChange: (open: boolean) => void;
}

export function AnulacionAsistenciaDialog({
  open,
  asistencia,
  onOpenChange,
}: AnulacionAsistenciaDialogProps) {
  const mutation = useAnularAsistencia(asistencia.id);
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnulacionAsistenciaForm>({
    resolver: zodResolver(anulacionAsistenciaSchema),
    defaultValues: { motivo: "" },
  });

  const limpiarFormulario = () => {
    reset({ motivo: "" });
    setSubmitError(undefined);
    mutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (mutation.isPending) return;
    if (!nextOpen) limpiarFormulario();
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);

    try {
      await mutation.mutateAsync({ motivo: values.motivo.trim() });
      toast.success("Asistencia anulada correctamente.");
      limpiarFormulario();
      onOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "No se pudo anular la asistencia.",
      );

      if (apiError.status === 409) {
        limpiarFormulario();
        onOpenChange(false);
        toast.error("La asistencia fue modificada recientemente.", {
          description: `${apiError.message} Actualizamos la información disponible.`,
        });
        return;
      }

      setSubmitError(apiError.message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-error-soft text-error">
              <CircleX className="size-5" />
            </span>
            <div>
              <DialogTitle>Anular asistencia</DialogTitle>
              <DialogDescription>
                Revisá los datos y el efecto de esta operación antes de confirmar.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ResumenOperacionAsistencia
          asistencia={asistencia}
          datosAdicionales={[
            {
              label: "Hora de ingreso",
              value: asistencia.ingreso
                ? formatHora(asistencia.ingreso.fechaHora)
                : "Sin registrar",
            },
            {
              label: "Hora de egreso",
              value: asistencia.egreso
                ? formatHora(asistencia.egreso.fechaHora)
                : "Sin registrar",
            },
          ]}
        />

        <Alert variant="warning" className="mb-4">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            La asistencia pasará al estado Anulada y no será considerada para
            el control operativo, métricas, reportes ni liquidaciones.
          </span>
        </Alert>

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField
            id="motivo-anulacion-asistencia"
            label="Motivo de anulación"
            error={errors.motivo?.message}
            hint="Máximo 500 caracteres."
            required
          >
            <Textarea
              id="motivo-anulacion-asistencia"
              rows={4}
              maxLength={500}
              placeholder="Indicá por qué debe anularse esta asistencia."
              aria-invalid={Boolean(errors.motivo)}
              aria-describedby={
                errors.motivo
                  ? "motivo-anulacion-asistencia-error"
                  : "motivo-anulacion-asistencia-hint"
              }
              {...register("motivo")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Anulando...
                </>
              ) : (
                <>Confirmar anulación</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
