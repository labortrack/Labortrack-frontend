import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRegularizarAsistenciaOmitida } from "../hooks/useAsistencias";
import {
  regularizacionAsistenciaSchema,
  type RegularizacionAsistenciaForm,
} from "../schemas/regularizacionAsistenciaSchema";
import type { AsistenciaOperativaDetalleResponseDto } from "../types/asistencia.types";
import {
  formatHora,
  TIPO_JORNADA_LABELS,
} from "../utils/asistenciaFormatters";
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
  Input,
  Spinner,
  Textarea,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

interface RegularizacionAsistenciaDialogProps {
  open: boolean;
  asistencia: AsistenciaOperativaDetalleResponseDto;
  onOpenChange: (open: boolean) => void;
}

export function RegularizacionAsistenciaDialog({
  open,
  asistencia,
  onOpenChange,
}: RegularizacionAsistenciaDialogProps) {
  const mutation = useRegularizarAsistenciaOmitida(asistencia.id);
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegularizacionAsistenciaForm>({
    resolver: zodResolver(regularizacionAsistenciaSchema),
    defaultValues: { horaIngreso: "", horaEgreso: "", motivo: "" },
  });

  const limpiarFormulario = () => {
    reset({ horaIngreso: "", horaEgreso: "", motivo: "" });
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
      await mutation.mutateAsync({
        horaIngreso: values.horaIngreso,
        horaEgreso: values.horaEgreso,
        motivo: values.motivo.trim(),
      });
      toast.success("Asistencia regularizada correctamente.");
      limpiarFormulario();
      onOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        "No se pudo regularizar la asistencia omitida.",
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
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ClipboardCheck className="size-5" />
            </span>
            <div>
              <DialogTitle>Registrar asistencia omitida</DialogTitle>
              <DialogDescription>
                Registrá la asistencia real del trabajador. La asistencia
                quedará como Egresado / Asistencia cerrada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ResumenOperacionAsistencia
          asistencia={asistencia}
          datosAdicionales={[
            {
              label: "Jornada asociada",
              value: `Jornada #${asistencia.jornadaId} · ${TIPO_JORNADA_LABELS[asistencia.tipoJornada]}`,
            },
            {
              label: "Horario planificado",
              value: `${formatHora(asistencia.horaInicioPlanificada)} a ${formatHora(asistencia.horaFinPlanificada)}`,
            },
          ]}
        />

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="hora-ingreso-regularizacion"
              label="Hora real de ingreso"
              error={errors.horaIngreso?.message}
              required
            >
              <Input
                id="hora-ingreso-regularizacion"
                type="time"
                aria-invalid={Boolean(errors.horaIngreso)}
                aria-describedby={
                  errors.horaIngreso
                    ? "hora-ingreso-regularizacion-error"
                    : undefined
                }
                {...register("horaIngreso")}
              />
            </FormField>
            <FormField
              id="hora-egreso-regularizacion"
              label="Hora real de egreso"
              error={errors.horaEgreso?.message}
              required
            >
              <Input
                id="hora-egreso-regularizacion"
                type="time"
                aria-invalid={Boolean(errors.horaEgreso)}
                aria-describedby={
                  errors.horaEgreso
                    ? "hora-egreso-regularizacion-error"
                    : undefined
                }
                {...register("horaEgreso")}
              />
            </FormField>
          </div>

          <FormField
            id="motivo-regularizacion"
            label="Motivo de regularización"
            error={errors.motivo?.message}
            hint="Máximo 500 caracteres."
            required
          >
            <Textarea
              id="motivo-regularizacion"
              rows={4}
              maxLength={500}
              placeholder="Indicá por qué la asistencia no se registró en tiempo y forma."
              aria-invalid={Boolean(errors.motivo)}
              aria-describedby={
                errors.motivo
                  ? "motivo-regularizacion-error"
                  : "motivo-regularizacion-hint"
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Regularizando...
                </>
              ) : (
                <>Confirmar regularización</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
