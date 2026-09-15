import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock3 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRegistrarAsistenciaManual } from "../hooks/useAsistencias";
import {
  registroEgresoManualSchema,
  registroIngresoManualSchema,
  type RegistroManualForm,
} from "../schemas/registroManualSchema";
import type {
  AsistenciaOperativaDetalleResponseDto,
  TipoRegistroManual,
} from "../types/asistencia.types";
import {
  formatHora,
  TIPO_ASISTENCIA_LABELS,
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

interface RegistroManualAsistenciaDialogProps {
  open: boolean;
  tipo: TipoRegistroManual;
  asistencia: AsistenciaOperativaDetalleResponseDto;
  onOpenChange: (open: boolean) => void;
}

export function RegistroManualAsistenciaDialog({
  open,
  tipo,
  asistencia,
  onOpenChange,
}: RegistroManualAsistenciaDialogProps) {
  const esIngreso = tipo === "ingreso";
  const mutation = useRegistrarAsistenciaManual(tipo, asistencia.id);
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RegistroManualForm>({
    resolver: zodResolver(
      esIngreso ? registroIngresoManualSchema : registroEgresoManualSchema,
    ),
    defaultValues: { hora: "", motivo: "" },
  });

  const limpiarFormulario = () => {
    reset({ hora: "", motivo: "" });
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

    if (!esIngreso && asistencia.ingreso) {
      const horaIngreso = formatHora(asistencia.ingreso.fechaHora);
      if (values.hora <= horaIngreso) {
        setError("hora", {
          message: "La hora de egreso debe ser posterior a la hora de ingreso.",
        });
        return;
      }
    }

    try {
      await mutation.mutateAsync(
        esIngreso
          ? { horaIngreso: values.hora, motivo: values.motivo.trim() }
          : { horaEgreso: values.hora, motivo: values.motivo.trim() },
      );
      toast.success(
        esIngreso
          ? "Ingreso manual registrado correctamente."
          : "Egreso manual registrado correctamente.",
      );
      reset({ hora: "", motivo: "" });
      setSubmitError(undefined);
      onOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        esIngreso
          ? "No se pudo registrar el ingreso manual."
          : "No se pudo registrar el egreso manual.",
      );

      if (apiError.status === 409) {
        reset({ hora: "", motivo: "" });
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
              <Clock3 className="size-5" />
            </span>
            <div>
              <DialogTitle>
                Registrar {esIngreso ? "ingreso" : "egreso"} manual
              </DialogTitle>
              <DialogDescription>
                Completá la información para registrar manualmente el {" "}
                {esIngreso ? "ingreso" : "egreso"} del operario.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ResumenOperacionAsistencia
          asistencia={asistencia}
          datosAdicionales={
            !esIngreso && asistencia.ingreso
              ? [
                  {
                    label: "Hora de ingreso registrada",
                    value: formatHora(asistencia.ingreso.fechaHora),
                  },
                  {
                    label: "Tipo de ingreso",
                    value: TIPO_ASISTENCIA_LABELS[asistencia.ingreso.tipo],
                  },
                ]
              : []
          }
        />

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField
            id={`hora-${tipo}-manual`}
            label={`Hora de ${tipo}`}
            error={errors.hora?.message}
            required
          >
            <Input
              id={`hora-${tipo}-manual`}
              type="time"
              aria-invalid={Boolean(errors.hora)}
              aria-describedby={errors.hora ? `hora-${tipo}-manual-error` : undefined}
              {...register("hora")}
            />
          </FormField>

          <FormField
            id={`motivo-${tipo}-manual`}
            label="Motivo"
            error={errors.motivo?.message}
            hint="Máximo 500 caracteres."
            required
          >
            <Textarea
              id={`motivo-${tipo}-manual`}
              rows={4}
              maxLength={500}
              placeholder={`Indicá por qué el ${tipo} no pudo registrarse mediante QR.`}
              aria-invalid={Boolean(errors.motivo)}
              aria-describedby={
                errors.motivo
                  ? `motivo-${tipo}-manual-error`
                  : `motivo-${tipo}-manual-hint`
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
                  Registrando...
                </>
              ) : (
                <>Confirmar {tipo}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
