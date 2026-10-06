import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import { cn } from "@/shared/utils/cn";
import {
  crearPlanTrabajoSchema,
  fechaLocalActual,
  sumarDiasFechaLocal,
  type PlanTrabajoFormValues,
} from "../schemas/planTrabajoSchemas";
import type {
  DiaSemana,
  PlanTrabajoDetalleResponseDto,
} from "../types/planTrabajo.types";
import {
  useCrearPlanTrabajo,
  useModificarPlanTrabajo,
} from "../hooks/usePlanesTrabajo";
import {
  formatDate,
  formatDays,
  formatTime,
} from "../utils/planTrabajoFormatters";

const dias: Array<{ value: DiaSemana; label: string }> = [
  { value: "LUNES", label: "Lunes" },
  { value: "MARTES", label: "Martes" },
  { value: "MIERCOLES", label: "Miércoles" },
  { value: "JUEVES", label: "Jueves" },
  { value: "VIERNES", label: "Viernes" },
  { value: "SABADO", label: "Sábado" },
  { value: "DOMINGO", label: "Domingo" },
];

type CreateProps = {
  mode: "create";
  cuadrillaId: number;
  cuadrillaNombre: string;
  obraNombre: string;
  plan?: never;
  onClose: () => void;
};

type EditProps = {
  mode: "edit";
  cuadrillaId: number;
  cuadrillaNombre: string;
  obraNombre: string;
  plan: PlanTrabajoDetalleResponseDto;
  onClose: () => void;
};

type Props = CreateProps | EditProps;

export function PlanTrabajoFormDialog(props: Props) {
  const isEdit = props.mode === "edit";
  const isVigente = isEdit && props.plan.estadoCalculado === "VIGENTE";
  const createMutation = useCrearPlanTrabajo(props.cuadrillaId);
  const editMutation = useModificarPlanTrabajo(
    props.cuadrillaId,
    isEdit ? props.plan.id : 0,
  );
  const mutation = isEdit ? editMutation : createMutation;
  const [submitError, setSubmitError] = useState<string>();
  const [pendingValues, setPendingValues] =
    useState<PlanTrabajoFormValues>();

  const form = useForm<PlanTrabajoFormValues>({
    resolver: zodResolver(
      crearPlanTrabajoSchema({
        modo: isVigente
          ? "modificar-vigente"
          : isEdit
            ? "modificar-programado"
            : "crear",
        fechaDesdeOriginal: isEdit
          ? props.plan.fechaVigenciaDesde
          : undefined,
      }),
    ),
    defaultValues: isEdit
      ? {
          fechaVigenciaDesde: props.plan.fechaVigenciaDesde,
          fechaVigenciaHasta: props.plan.fechaVigenciaHasta,
          horaInicioPlanificada: formatTime(
            props.plan.horaInicioPlanificada,
          ),
          horaFinPlanificada: formatTime(props.plan.horaFinPlanificada),
          dias: props.plan.dias,
        }
      : {
          fechaVigenciaDesde: "",
          fechaVigenciaHasta: "",
          horaInicioPlanificada: "",
          horaFinPlanificada: "",
          dias: [],
        },
  });
  const fechaDesde = useWatch({
    control: form.control,
    name: "fechaVigenciaDesde",
  });

  const close = () => {
    if (!mutation.isPending) props.onClose();
  };

  const execute = async (values: PlanTrabajoFormValues) => {
    setSubmitError(undefined);
    try {
      if (isEdit) {
        const result = await editMutation.mutateAsync(values);
        toast.success(result.mensaje, {
          description: `${result.jornadasActualizadas} actualizadas, ${result.jornadasCreadas} creadas y ${result.jornadasAnuladas} anuladas.`,
        });
      } else {
        const result = await createMutation.mutateAsync(values);
        toast.success("Plan de trabajo creado correctamente.", {
          description: `Se generaron ${result.cantidadJornadas} jornadas.`,
        });
      }
      props.onClose();
    } catch (error) {
      setPendingValues(undefined);
      setSubmitError(
        normalizeApiError(
          error,
          isEdit
            ? "No se pudo modificar el plan de trabajo."
            : "No se pudo crear el plan de trabajo.",
        ).message,
      );
    }
  };

  const submit = form.handleSubmit((values) => {
    setSubmitError(undefined);
    if (isVigente) {
      setPendingValues(values);
      return;
    }
    void execute(values);
  });

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-w-2xl" aria-busy={mutation.isPending}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modificar plan de trabajo" : "Crear plan de trabajo"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualizá la planificación futura de la cuadrilla."
              : "Definí el período, los horarios y los días de trabajo de la cuadrilla."}
          </DialogDescription>
        </DialogHeader>

        {pendingValues ? (
          <div className="space-y-5">
            <Alert>
              <Info className="mt-0.5 size-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">Confirmá la replanificación</p>
                <p>
                  Los cambios se aplicarán desde mañana. La jornada actual y
                  las anteriores conservarán su planificación original; las
                  jornadas futuras podrán actualizarse, crearse o anularse.
                </p>
              </div>
            </Alert>
            <div className="grid gap-4 rounded-lg border border-border bg-muted p-4 sm:grid-cols-2">
              <ReadOnlyField
                label="Nueva vigencia"
                value={`${formatDate(pendingValues.fechaVigenciaDesde)} — ${formatDate(pendingValues.fechaVigenciaHasta)}`}
              />
              <ReadOnlyField
                label="Nuevo horario"
                value={`${pendingValues.horaInicioPlanificada} a ${pendingValues.horaFinPlanificada}`}
              />
              <div className="sm:col-span-2">
                <ReadOnlyField
                  label="Días de trabajo"
                  value={formatDays(pendingValues.dias)}
                />
              </div>
            </div>
            {submitError ? <ErrorAlert message={submitError} /> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingValues(undefined)}
                disabled={mutation.isPending}
              >
                Volver a editar
              </Button>
              <Button
                type="button"
                onClick={() => void execute(pendingValues)}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Spinner /> : null}
                {mutation.isPending ? "Modificando…" : "Confirmar modificación"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="space-y-5">
              <div className="grid gap-4 rounded-lg border border-border bg-muted p-4 sm:grid-cols-2">
                <ReadOnlyField label="Obra" value={props.obraNombre} />
                <ReadOnlyField
                  label="Cuadrilla"
                  value={props.cuadrillaNombre}
                />
              </div>

              {isVigente ? (
                <Alert>
                  <Info className="mt-0.5 size-4 shrink-0" />
                  Los cambios de un plan vigente se aplicarán desde el día
                  siguiente y no modificarán la jornada actual ni las anteriores.
                </Alert>
              ) : null}
              {submitError ? <ErrorAlert message={submitError} /> : null}

              <fieldset
                disabled={mutation.isPending}
                className="min-w-0 space-y-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    icon={CalendarDays}
                    id="plan-fecha-desde"
                    label="Fecha desde"
                    error={form.formState.errors.fechaVigenciaDesde?.message}
                    hint={
                      isVigente
                        ? "La fecha de inicio original no puede modificarse."
                        : undefined
                    }
                    required
                  >
                    <Input
                      id="plan-fecha-desde"
                      type="date"
                      min={
                        isVigente
                          ? undefined
                          : sumarDiasFechaLocal(fechaLocalActual(), 1)
                      }
                      readOnly={isVigente}
                      aria-invalid={Boolean(
                        form.formState.errors.fechaVigenciaDesde,
                      )}
                      aria-describedby={
                        form.formState.errors.fechaVigenciaDesde
                          ? "plan-fecha-desde-error"
                          : isVigente
                            ? "plan-fecha-desde-hint"
                            : undefined
                      }
                      {...form.register("fechaVigenciaDesde")}
                    />
                  </FormField>
                  <FormField
                    icon={CalendarDays}
                    id="plan-fecha-hasta"
                    label="Fecha hasta"
                    error={form.formState.errors.fechaVigenciaHasta?.message}
                    required
                  >
                    <Input
                      id="plan-fecha-hasta"
                      type="date"
                      min={
                        isVigente
                          ? sumarDiasFechaLocal(fechaLocalActual(), 1)
                          : fechaDesde
                            ? sumarDiasFechaLocal(fechaDesde, 1)
                            : undefined
                      }
                      aria-invalid={Boolean(
                        form.formState.errors.fechaVigenciaHasta,
                      )}
                      aria-describedby={
                        form.formState.errors.fechaVigenciaHasta
                          ? "plan-fecha-hasta-error"
                          : undefined
                      }
                      {...form.register("fechaVigenciaHasta")}
                    />
                  </FormField>
                  <FormField
                    icon={Clock3}
                    id="plan-hora-inicio"
                    label="Hora de inicio"
                    error={form.formState.errors.horaInicioPlanificada?.message}
                    required
                  >
                    <Input
                      id="plan-hora-inicio"
                      type="time"
                      aria-invalid={Boolean(
                        form.formState.errors.horaInicioPlanificada,
                      )}
                      aria-describedby={
                        form.formState.errors.horaInicioPlanificada
                          ? "plan-hora-inicio-error"
                          : undefined
                      }
                      {...form.register("horaInicioPlanificada")}
                    />
                  </FormField>
                  <FormField
                    icon={Clock3}
                    id="plan-hora-fin"
                    label="Hora de fin"
                    error={form.formState.errors.horaFinPlanificada?.message}
                    required
                  >
                    <Input
                      id="plan-hora-fin"
                      type="time"
                      aria-invalid={Boolean(
                        form.formState.errors.horaFinPlanificada,
                      )}
                      aria-describedby={
                        form.formState.errors.horaFinPlanificada
                          ? "plan-hora-fin-error"
                          : undefined
                      }
                      {...form.register("horaFinPlanificada")}
                    />
                  </FormField>
                </div>

                <Controller
                  name="dias"
                  control={form.control}
                  render={({ field }) => (
                    <fieldset
                      className="space-y-2"
                      aria-describedby={
                        form.formState.errors.dias ? "plan-dias-error" : undefined
                      }
                    >
                      <legend className="text-sm font-medium">
                        Días de trabajo *
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {dias.map((dia) => {
                          const selected = field.value.includes(dia.value);
                          return (
                            <button
                              key={dia.value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() =>
                                field.onChange(
                                  selected
                                    ? field.value.filter(
                                        (value) => value !== dia.value,
                                      )
                                    : [...field.value, dia.value],
                                )
                              }
                              className={cn(
                                "rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                                selected
                                  ? "border-primary bg-primary-soft text-primary"
                                  : "border-border-strong bg-card text-foreground-muted hover:border-primary hover:text-primary",
                              )}
                            >
                              {dia.label}
                            </button>
                          );
                        })}
                      </div>
                      {form.formState.errors.dias?.message ? (
                        <p
                          id="plan-dias-error"
                          className="text-xs font-medium text-error"
                        >
                          {form.formState.errors.dias.message}
                        </p>
                      ) : null}
                    </fieldset>
                  )}
                />
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
                {mutation.isPending
                  ? isEdit
                    ? "Modificando…"
                    : "Creando…"
                  : isEdit
                    ? isVigente
                      ? "Revisar cambios"
                      : "Guardar cambios"
                    : "Crear plan"}
              </Button>
            </DialogFooter>
          </form>
        )}
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

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="error">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {message}
    </Alert>
  );
}
