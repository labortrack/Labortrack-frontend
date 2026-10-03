import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CalendarDays, Clock3, Info } from "lucide-react";
import { toast } from "sonner";
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
} from "@/shared/ui";
import { FormField } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useCrearJornadaExtraordinaria } from "../hooks/usePlanesTrabajo";
import {
  crearJornadaExtraordinariaSchema,
  fechaLocalActual,
  type JornadaExtraordinariaFormValues,
} from "../schemas/planTrabajoSchemas";
import type { PlanTrabajoDetalleResponseDto } from "../types/planTrabajo.types";
import {
  formatDate,
  formatDays,
  formatTime,
} from "../utils/planTrabajoFormatters";

export function CrearJornadaExtraordinariaDialog({
  plan,
  onClose,
}: {
  plan: PlanTrabajoDetalleResponseDto;
  onClose: () => void;
}) {
  const mutation = useCrearJornadaExtraordinaria(plan.cuadrillaId, plan.id);
  const [submitError, setSubmitError] = useState<string>();
  const form = useForm<JornadaExtraordinariaFormValues>({
    resolver: zodResolver(
      crearJornadaExtraordinariaSchema({
        fechaVigenciaDesde: plan.fechaVigenciaDesde,
        fechaVigenciaHasta: plan.fechaVigenciaHasta,
      }),
    ),
    defaultValues: {
      fecha: "",
      horaInicioPlanificada: "",
      horaFinPlanificada: "",
    },
  });

  const close = () => {
    if (!mutation.isPending) onClose();
  };

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      const result = await mutation.mutateAsync(values);
      toast.success(result.mensaje, {
        description:
          result.asistenciasGeneradas > 0
            ? `Se generaron ${result.asistenciasGeneradas} asistencias esperadas.`
            : "Las asistencias se generarán cuando corresponda.",
      });
      onClose();
    } catch (error) {
      setSubmitError(
        normalizeApiError(
          error,
          "No se pudo crear la jornada extraordinaria.",
        ).message,
      );
    }
  });

  const minDate =
    plan.fechaVigenciaDesde > fechaLocalActual()
      ? plan.fechaVigenciaDesde
      : fechaLocalActual();

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl" aria-busy={mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Crear jornada extraordinaria</DialogTitle>
          <DialogDescription>
            Registrá una jornada puntual no prevista en la planificación habitual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate>
          <div className="space-y-5">
            <div className="grid gap-4 rounded-lg border border-border bg-muted p-4 sm:grid-cols-2">
              <ReadOnlyField label="Obra" value={plan.obraNombre} />
              <ReadOnlyField label="Cuadrilla" value={plan.cuadrillaNombre} />
              <ReadOnlyField
                label="Plan asociado"
                value={`${formatDate(plan.fechaVigenciaDesde)} — ${formatDate(plan.fechaVigenciaHasta)}`}
              />
              <ReadOnlyField
                label="Horario habitual"
                value={`${formatTime(plan.horaInicioPlanificada)} a ${formatTime(plan.horaFinPlanificada)}`}
              />
              <div className="sm:col-span-2">
                <ReadOnlyField
                  label="Días habituales"
                  value={formatDays(plan.dias)}
                />
              </div>
            </div>

            <Alert>
              <Info className="mt-0.5 size-4 shrink-0" />
              El tipo de jornada y la decisión de día no laborable se
              determinarán automáticamente según la fecha seleccionada.
            </Alert>

            {submitError ? (
              <Alert variant="error">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {submitError}
              </Alert>
            ) : null}

            <fieldset
              disabled={mutation.isPending}
              className="grid min-w-0 gap-4 sm:grid-cols-3"
            >
              <FormField
                icon={CalendarDays}
                id="jornada-extra-fecha"
                label="Fecha"
                error={form.formState.errors.fecha?.message}
                required
              >
                <Input
                  id="jornada-extra-fecha"
                  type="date"
                  min={minDate}
                  max={plan.fechaVigenciaHasta}
                  aria-invalid={Boolean(form.formState.errors.fecha)}
                  aria-describedby={
                    form.formState.errors.fecha
                      ? "jornada-extra-fecha-error"
                      : undefined
                  }
                  {...form.register("fecha")}
                />
              </FormField>
              <FormField
                icon={Clock3}
                id="jornada-extra-inicio"
                label="Hora de inicio"
                error={form.formState.errors.horaInicioPlanificada?.message}
                required
              >
                <Input
                  id="jornada-extra-inicio"
                  type="time"
                  aria-invalid={Boolean(
                    form.formState.errors.horaInicioPlanificada,
                  )}
                  aria-describedby={
                    form.formState.errors.horaInicioPlanificada
                      ? "jornada-extra-inicio-error"
                      : undefined
                  }
                  {...form.register("horaInicioPlanificada")}
                />
              </FormField>
              <FormField
                icon={Clock3}
                id="jornada-extra-fin"
                label="Hora de fin"
                error={form.formState.errors.horaFinPlanificada?.message}
                required
              >
                <Input
                  id="jornada-extra-fin"
                  type="time"
                  aria-invalid={Boolean(
                    form.formState.errors.horaFinPlanificada,
                  )}
                  aria-describedby={
                    form.formState.errors.horaFinPlanificada
                      ? "jornada-extra-fin-error"
                      : undefined
                  }
                  {...form.register("horaFinPlanificada")}
                />
              </FormField>
            </fieldset>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Spinner /> : null}
              {mutation.isPending ? "Creando…" : "Crear jornada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}
