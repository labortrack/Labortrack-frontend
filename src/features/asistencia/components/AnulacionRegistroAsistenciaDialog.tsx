import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CircleX, TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAnularRegistroAsistencia } from "../hooks/useAsistencias";
import {
  anulacionRegistroSchema,
  type AnulacionRegistroForm,
} from "../schemas/anulacionRegistroSchema";
import type {
  AsistenciaOperativaDetalleResponseDto,
  TipoAnulacionRegistro,
} from "../types/asistencia.types";
import {
  formatHora,
  TIPO_ASISTENCIA_LABELS,
} from "../utils/asistenciaFormatters";
import {
  type DatoOperacionAsistencia,
  ResumenOperacionAsistencia,
} from "./ResumenOperacionAsistencia";
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

const ADVERTENCIAS = {
  ingreso:
    "Si la jornada continúa vigente, la asistencia volverá a Pendiente de ingreso. Si la jornada ya finalizó, pasará a Ausente.",
  egreso:
    "Se dejará sin efecto el egreso registrado. La asistencia volverá a Presente / Asistencia abierta y se conservará el ingreso previamente registrado.",
} satisfies Record<TipoAnulacionRegistro, string>;

interface AnulacionRegistroAsistenciaDialogProps {
  open: boolean;
  tipo: TipoAnulacionRegistro;
  asistencia: AsistenciaOperativaDetalleResponseDto;
  onOpenChange: (open: boolean) => void;
}

function obtenerDatosAdicionales(
  tipo: TipoAnulacionRegistro,
  asistencia: AsistenciaOperativaDetalleResponseDto,
) {
  const datos: DatoOperacionAsistencia[] = [];

  if (asistencia.ingreso) {
    datos.push({
      label: tipo === "ingreso" ? "Hora de ingreso registrada" : "Hora de ingreso",
      value: formatHora(asistencia.ingreso.fechaHora),
    });
    if (tipo === "ingreso") {
      datos.push({
        label: "Tipo de ingreso",
        value: TIPO_ASISTENCIA_LABELS[asistencia.ingreso.tipo],
      });
    }
  }

  if (tipo === "egreso" && asistencia.egreso) {
    datos.push(
      {
        label: "Hora de egreso registrada",
        value: formatHora(asistencia.egreso.fechaHora),
      },
      {
        label: "Tipo de egreso",
        value: TIPO_ASISTENCIA_LABELS[asistencia.egreso.tipo],
      },
    );
  }

  return datos;
}

export function AnulacionRegistroAsistenciaDialog({
  open,
  tipo,
  asistencia,
  onOpenChange,
}: AnulacionRegistroAsistenciaDialogProps) {
  const mutation = useAnularRegistroAsistencia(tipo, asistencia.id);
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnulacionRegistroForm>({
    resolver: zodResolver(anulacionRegistroSchema),
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
      toast.success(
        tipo === "ingreso"
          ? "Ingreso anulado correctamente."
          : "Egreso anulado correctamente.",
      );
      reset({ motivo: "" });
      onOpenChange(false);
    } catch (error) {
      const apiError = normalizeApiError(
        error,
        tipo === "ingreso"
          ? "No se pudo anular el ingreso."
          : "No se pudo anular el egreso.",
      );

      if (apiError.status === 409) {
        reset({ motivo: "" });
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
              <DialogTitle>Anular {tipo} registrado</DialogTitle>
              <DialogDescription>
                Revisá el efecto de la operación antes de confirmar.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ResumenOperacionAsistencia
          asistencia={asistencia}
          datosAdicionales={obtenerDatosAdicionales(tipo, asistencia)}
        />

        <Alert variant="warning" className="mb-4">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{ADVERTENCIAS[tipo]}</span>
        </Alert>

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField
            id={`motivo-anulacion-${tipo}`}
            label="Motivo de anulación"
            error={errors.motivo?.message}
            hint="Máximo 500 caracteres."
            required
          >
            <Textarea
              id={`motivo-anulacion-${tipo}`}
              rows={4}
              maxLength={500}
              placeholder={`Explicá por qué debe anularse el ${tipo} registrado.`}
              aria-invalid={Boolean(errors.motivo)}
              aria-describedby={
                errors.motivo
                  ? `motivo-anulacion-${tipo}-error`
                  : `motivo-anulacion-${tipo}-hint`
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
                <>
                  <CircleX />
                  Confirmar anulación
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
