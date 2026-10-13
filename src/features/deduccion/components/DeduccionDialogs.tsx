import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlignLeft,
  CheckCircle2,
  Hash,
  Layers,
  MinusCircle,
  Tags,
  Users,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  deduccionSchema,
  type DeduccionFormValues,
} from "../schemas/deduccionSchemas";
import {
  useActivarDeduccion,
  useBajaDeduccion,
  useCrearDeduccion,
  useModificarDeduccion,
} from "../hooks/useDeducciones";
import type { DeduccionResponseDto } from "../types/deduccion.types";
import { BASE_IMPONIBLE_PORCENTAJE_OPTIONS } from "../utils/deduccionLabels";
import type {
  BaseImponible,
  TipoConcepto,
} from "@/features/recibos/types/parametrosLiquidables.types";
import {
  BASE_IMPONIBLE_LABELS,
  TIPO_CONCEPTO_OPTIONS,
} from "@/features/recibos/utils/parametrosLiquidablesLabels";
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
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Switch,
  Textarea,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

// ─── Modal: Crear / Modificar Deducción ─────────────────────────────────────

export function DeduccionFormDialog({
  deduccion,
  open,
  onOpenChange,
}: {
  deduccion: DeduccionResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(deduccion);
  const crear = useCrearDeduccion();
  const modificar = useModificarDeduccion();
  const mutation = isEdit ? modificar : crear;
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    control,
    reset,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<DeduccionFormValues>({
    resolver: zodResolver(deduccionSchema),
    defaultValues: deduccion
      ? {
          nombreDeduccion: deduccion.nombreDeduccion,
          descripcionDeduccion: deduccion.descripcionDeduccion,
          tipoConcepto: deduccion.tipoConcepto,
          baseImponible: deduccion.baseImponible,
          valorDeduccion: deduccion.valorDeduccion,
          isGeneral: deduccion.isGeneral,
        }
      : {
          nombreDeduccion: "",
          descripcionDeduccion: "",
          isGeneral: false,
        },
  });

  const tipoConcepto = useWatch({ control, name: "tipoConcepto" });
  const esPorcentaje = tipoConcepto === "PORCENTAJE";

  // Un monto fijo no se calcula sobre nada: su base es siempre NO_APLICA.
  // Un porcentaje obliga a elegir la base, así que se limpia en vez de suponer una:
  // con "" el Select muestra el placeholder y el schema lo rechaza como no elegido.
  const handleTipoChange = (tipo: TipoConcepto) => {
    if (tipo === "FIJO") {
      setValue("baseImponible", "NO_APLICA", { shouldValidate: true });
    } else {
      setValue("baseImponible", "" as BaseImponible);
    }
  };

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
    const payload = {
      ...values,
      nombreDeduccion: values.nombreDeduccion.trim(),
      descripcionDeduccion: values.descripcionDeduccion.trim(),
    };
    try {
      if (isEdit && deduccion) {
        await modificar.mutateAsync({ id: deduccion.id, payload });
        toast.success("Deducción actualizada correctamente.", {
          description: `"${payload.nombreDeduccion}" ha sido modificada.`,
        });
      } else {
        await crear.mutateAsync(payload);
        toast.success("Deducción creada correctamente.", {
          description: `"${payload.nombreDeduccion}" ha sido agregada al catálogo de deducciones.`,
        });
      }
      handleOpenChange(false);
    } catch (error) {
      const normalized = normalizeApiError(
        error,
        "No se pudo guardar la deducción.",
      );
      if (normalized.status === 409) {
        setError(
          "nombreDeduccion",
          { message: normalized.message },
          { shouldFocus: true },
        );
      } else {
        setSubmitError(normalized.message);
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl" aria-busy={mutation.isPending}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <MinusCircle className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {isEdit ? "Modificar Deducción" : "Registrar Nueva Deducción"}
              </DialogTitle>
              <DialogDescription>
                El nombre debe ser único dentro del catálogo de deducciones.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4" />
            {submitError}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <fieldset disabled={mutation.isPending} className="min-w-0 space-y-4">
            <FormField
              icon={Tags}
              id="deduccion-nombre"
              label="Nombre"
              error={errors.nombreDeduccion?.message}
              required
            >
              <Input
                id="deduccion-nombre"
                autoComplete="off"
                placeholder="Ej: Jubilación, Obra Social, Cuota Sindical..."
                aria-invalid={Boolean(errors.nombreDeduccion)}
                {...register("nombreDeduccion")}
              />
            </FormField>

            <FormField
              icon={AlignLeft}
              id="deduccion-descripcion"
              label="Descripción"
              error={errors.descripcionDeduccion?.message}
              required
            >
              <Textarea
                id="deduccion-descripcion"
                rows={3}
                aria-invalid={Boolean(errors.descripcionDeduccion)}
                {...register("descripcionDeduccion")}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                icon={Layers}
                id="deduccion-tipo"
                label="Tipo de Deducción"
                error={errors.tipoConcepto?.message}
                required
              >
                <Controller
                  name="tipoConcepto"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTipoChange(value as TipoConcepto);
                      }}
                    >
                      <SelectTrigger
                        id="deduccion-tipo"
                        aria-invalid={Boolean(errors.tipoConcepto)}
                      >
                        <SelectValue placeholder="Seleccioná un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPO_CONCEPTO_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                icon={Layers}
                id="deduccion-base"
                label="Base Imponible"
                error={tipoConcepto ? errors.baseImponible?.message : undefined}
                hint={
                  tipoConcepto === "FIJO"
                    ? "Un monto fijo no se calcula sobre ninguna base."
                    : undefined
                }
                required
              >
                <Controller
                  name="baseImponible"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={!esPorcentaje}
                    >
                      <SelectTrigger
                        id="deduccion-base"
                        aria-invalid={Boolean(errors.baseImponible)}
                      >
                        <SelectValue
                          placeholder={
                            esPorcentaje
                              ? "Seleccioná una base"
                              : "Elegí primero el tipo"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {esPorcentaje ? (
                          BASE_IMPONIBLE_PORCENTAJE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="NO_APLICA">
                            {BASE_IMPONIBLE_LABELS.NO_APLICA}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <FormField
              icon={Hash}
              id="deduccion-valor"
              label={esPorcentaje ? "Porcentaje (%)" : "Monto ($)"}
              error={errors.valorDeduccion?.message}
              hint={
                esPorcentaje
                  ? "Entre 0,1 y 100, con hasta 2 decimales."
                  : "Mayor a 0, con hasta 2 decimales."
              }
              required
            >
              <Input
                id="deduccion-valor"
                type="number"
                step="0.01"
                min={esPorcentaje ? "0.1" : "0.01"}
                max={esPorcentaje ? "100" : undefined}
                placeholder="0.00"
                aria-invalid={Boolean(errors.valorDeduccion)}
                {...register("valorDeduccion", { valueAsNumber: true })}
              />
            </FormField>

            <Controller
              name="isGeneral"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <Label
                      htmlFor="deduccion-general"
                      className="flex items-center gap-2"
                    >
                      <Users
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      Aplica de forma general
                    </Label>
                    <p className="mt-1 text-xs text-foreground-muted">
                      Se incluye por defecto en todos los recibos de sueldo.
                    </p>
                  </div>
                  <Switch
                    id="deduccion-general"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </div>
              )}
            />
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
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal: Dar de baja Deducción ───────────────────────────────────────────

export function BajaDeduccionDialog({
  deduccion,
  onOpenChange,
}: {
  deduccion: DeduccionResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useBajaDeduccion();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!deduccion) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(deduccion.id);
      toast.success("Deducción dada de baja.", {
        description: `"${deduccion.nombreDeduccion}" ya no se aplicará en las próximas pre-liquidaciones.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo dar de baja la deducción.")
          .message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(deduccion)}
      title="¿Dar de baja esta deducción?"
      description={`"${deduccion?.nombreDeduccion ?? ""}" dejará de aplicarse en las próximas pre-liquidaciones de recibos.`}
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

// ─── Modal: Reactivar Deducción ─────────────────────────────────────────────

export function ActivarDeduccionDialog({
  deduccion,
  onOpenChange,
}: {
  deduccion: DeduccionResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useActivarDeduccion();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!deduccion) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(deduccion.id);
      toast.success("Deducción reactivada.", {
        description: `"${deduccion.nombreDeduccion}" vuelve a estar disponible.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo reactivar la deducción.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(deduccion)}
      title="¿Reactivar esta deducción?"
      description={`"${deduccion?.nombreDeduccion ?? ""}" volverá a aplicarse en las próximas pre-liquidaciones de recibos.`}
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
