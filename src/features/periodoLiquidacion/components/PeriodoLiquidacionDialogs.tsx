import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlignLeft,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  periodoLiquidacionSchema,
  type PeriodoLiquidacionFormValues,
} from "../schemas/periodoLiquidacionSchemas";
import {
  useActivarPeriodoLiquidacion,
  useBajaPeriodoLiquidacion,
  useCrearPeriodoLiquidacion,
  useModificarPeriodoLiquidacion,
} from "../hooks/usePeriodosLiquidacion";
import type { PeriodoLiquidacionResponseDto } from "../types/periodoLiquidacion.types";
import {
  HORA_EJECUCION_PRE_LIQUIDACION,
  TIPO_PERIODO_OPTIONS,
  calcularFechaHasta,
  formatFecha,
  primerDiaEjecucion,
} from "../utils/periodoLiquidacion";
import { ConfirmDialog, FormField } from "@/shared/components";
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
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";

// ─── Modal: Crear / Modificar Período de Liquidación ────────────────────────

export function PeriodoLiquidacionFormDialog({
  periodo,
  open,
  onOpenChange,
}: {
  periodo: PeriodoLiquidacionResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(periodo);
  const crear = useCrearPeriodoLiquidacion();
  const modificar = useModificarPeriodoLiquidacion();
  const mutation = isEdit ? modificar : crear;
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<PeriodoLiquidacionFormValues>({
    resolver: zodResolver(periodoLiquidacionSchema),
    defaultValues: periodo
      ? {
          descripcionPeriodoLiquidacion: periodo.descripcionPeriodoLiquidacion,
          tipoPeriodo: periodo.tipoPeriodo,
          fechaDesde: periodo.fechaDesde,
          fechaEjecucionPreLiquidacion:
            periodo.fechaEjecucionPreLiquidacion.slice(0, 10),
        }
      : {
          descripcionPeriodoLiquidacion: "",
          tipoPeriodo: "QUINCENAL",
          fechaDesde: "",
          fechaEjecucionPreLiquidacion: "",
        },
  });

  const [tipoPeriodo, fechaDesde] = useWatch({
    control,
    name: ["tipoPeriodo", "fechaDesde"],
  });
  const fechaHasta = fechaDesde
    ? calcularFechaHasta(fechaDesde, tipoPeriodo)
    : null;
  const primerDia = fechaHasta ? primerDiaEjecucion(fechaHasta) : null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    const descripcion = values.descripcionPeriodoLiquidacion.trim();
    const fechaEjecucion = values.fechaEjecucionPreLiquidacion
      ? `${values.fechaEjecucionPreLiquidacion}T${HORA_EJECUCION_PRE_LIQUIDACION}`
      : null;
    try {
      if (isEdit && periodo) {
        await modificar.mutateAsync({
          id: periodo.id,
          payload: {
            descripcionPeriodoLiquidacion: descripcion,
            fechaEjecucionPreLiquidacion: fechaEjecucion,
          },
        });
        toast.success("Período actualizado correctamente.", {
          description: `"${descripcion}" ha sido modificado.`,
        });
      } else {
        await crear.mutateAsync({
          descripcionPeriodoLiquidacion: descripcion,
          tipoPeriodo: values.tipoPeriodo,
          fechaDesde: values.fechaDesde,
          fechaEjecucionPreLiquidacion: fechaEjecucion,
        });
        toast.success("Período creado correctamente.", {
          description: `"${descripcion}" ha sido programado para su liquidación.`,
        });
      }
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo guardar el período.").message,
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl" aria-busy={mutation.isPending}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <CalendarClock className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {isEdit
                  ? "Modificar Período de Liquidación"
                  : "Nuevo Período de Liquidación"}
              </DialogTitle>
              <DialogDescription>
                Definí el rango de fechas y la ejecución automatizada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isEdit ? (
          <Alert className="mb-4">
            <Info className="mt-0.5 size-4 shrink-0" />
            El rango de fechas queda fijado en el alta. Para corregirlo, dá de
            baja este período y creá uno nuevo.
          </Alert>
        ) : null}

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4" />
            {submitError}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <fieldset disabled={mutation.isPending} className="min-w-0 space-y-4">
            <FormField
              icon={AlignLeft}
              id="periodo-descripcion"
              label="Descripción / Nombre del Período"
              error={errors.descripcionPeriodoLiquidacion?.message}
              required
            >
              <Input
                id="periodo-descripcion"
                autoComplete="off"
                placeholder="Ej: Julio 2026 - 1era Quincena"
                aria-invalid={Boolean(errors.descripcionPeriodoLiquidacion)}
                {...register("descripcionPeriodoLiquidacion")}
              />
            </FormField>

            <FormField
              icon={CalendarRange}
              id="periodo-tipo"
              label="Tipo de Período"
              error={errors.tipoPeriodo?.message}
              required
            >
              <Controller
                name="tipoPeriodo"
                control={control}
                render={({ field }) => (
                  <div
                    id="periodo-tipo"
                    role="radiogroup"
                    className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1"
                  >
                    {TIPO_PERIODO_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === opt.value}
                        disabled={isEdit}
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          "flex h-8 items-center justify-center rounded-control px-3 text-xs font-semibold transition-all",
                          field.value === opt.value
                            ? "bg-card text-primary shadow-soft"
                            : "text-foreground-muted hover:text-foreground",
                          isEdit ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                icon={CalendarDays}
                id="periodo-fecha-desde"
                label="Fecha Inicio"
                error={errors.fechaDesde?.message}
                hint={
                  isEdit
                    ? undefined
                    : tipoPeriodo === "MENSUAL"
                      ? "Día 1 del mes."
                      : "Día 1 o día 16 del mes."
                }
                required
              >
                <Input
                  id="periodo-fecha-desde"
                  type="date"
                  disabled={isEdit}
                  aria-invalid={Boolean(errors.fechaDesde)}
                  {...register("fechaDesde")}
                />
              </FormField>

              <FormField
                icon={CalendarDays}
                id="periodo-fecha-hasta"
                label="Fecha Fin"
                hint={isEdit ? undefined : "Se calcula según el tipo y el inicio."}
              >
                <Input
                  id="periodo-fecha-hasta"
                  readOnly
                  disabled
                  placeholder="dd/mm/aaaa"
                  value={fechaHasta ? formatFecha(fechaHasta) : ""}
                />
              </FormField>
            </div>

            <FormField
              icon={Clock}
              id="periodo-fecha-ejecucion"
              label="Fecha de Ejecución Pre-Liquidación"
              error={errors.fechaEjecucionPreLiquidacion?.message}
              hint={
                primerDia
                  ? `La generación automática de recibos se ejecuta a las ${HORA_EJECUCION_PRE_LIQUIDACION} hs del día elegido. Si la dejás vacía, se programa para el ${formatFecha(primerDia)}.`
                  : `La generación automática de recibos se ejecuta a las ${HORA_EJECUCION_PRE_LIQUIDACION} hs del día elegido, que debe ser posterior al cierre del período.`
              }
            >
              <Input
                id="periodo-fecha-ejecucion"
                type="date"
                min={primerDia ?? undefined}
                aria-invalid={Boolean(errors.fechaEjecucionPreLiquidacion)}
                {...register("fechaEjecucionPreLiquidacion")}
              />
            </FormField>
          </fieldset>

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
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Guardar Período
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal: Dar de baja Período de Liquidación ──────────────────────────────

export function BajaPeriodoLiquidacionDialog({
  periodo,
  onOpenChange,
}: {
  periodo: PeriodoLiquidacionResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useBajaPeriodoLiquidacion();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!periodo) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(periodo.id);
      toast.success("Período dado de baja.", {
        description: `"${periodo.descripcionPeriodoLiquidacion}" ya no se pre-liquidará.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo dar de baja el período.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(periodo)}
      title="¿Dar de baja este período?"
      description={`"${periodo?.descripcionPeriodoLiquidacion ?? ""}" (${formatFecha(periodo?.fechaDesde)} al ${formatFecha(periodo?.fechaHasta)}) no se pre-liquidará y su rango de fechas quedará libre para otro período.`}
      confirmLabel="Confirmar Baja"
      destructive
      pending={mutation.isPending}
      onOpenChange={handleOpenChange}
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

// ─── Modal: Reactivar Período de Liquidación ────────────────────────────────

export function ActivarPeriodoLiquidacionDialog({
  periodo,
  onOpenChange,
}: {
  periodo: PeriodoLiquidacionResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useActivarPeriodoLiquidacion();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!periodo) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(periodo.id);
      toast.success("Período reactivado.", {
        description: `"${periodo.descripcionPeriodoLiquidacion}" vuelve a estar programado para su pre-liquidación.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo reactivar el período.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(periodo)}
      title="¿Reactivar este período?"
      description={`"${periodo?.descripcionPeriodoLiquidacion ?? ""}" (${formatFecha(periodo?.fechaDesde)} al ${formatFecha(periodo?.fechaHasta)}) volverá a programarse para su pre-liquidación. No se podrá reactivar si otro período vigente ya ocupa ese rango de fechas.`}
      confirmLabel="Confirmar Reactivación"
      pending={mutation.isPending}
      onOpenChange={handleOpenChange}
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
