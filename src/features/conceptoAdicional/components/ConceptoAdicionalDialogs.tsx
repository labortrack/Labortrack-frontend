import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlignLeft,
  CheckCircle2,
  Hash,
  Layers,
  PlusCircle,
  Scale,
  Tags,
  Users,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  conceptoAdicionalSchema,
  type ConceptoAdicionalFormValues,
} from "../schemas/conceptoAdicionalSchemas";
import {
  useActivarConceptoAdicional,
  useBajaConceptoAdicional,
  useCrearConceptoAdicional,
  useModificarConceptoAdicional,
} from "../hooks/useConceptosAdicionales";
import type { ConceptoAdicionalResponseDto } from "../types/conceptoAdicional.types";
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

// La base de un concepto queda determinada por su tipo: un monto fijo no se calcula
// sobre nada, y un porcentaje solo puede calcularse sobre el salario básico.
const BASE_POR_TIPO: Record<TipoConcepto, BaseImponible> = {
  FIJO: "NO_APLICA",
  PORCENTAJE: "SALARIO_BASICO",
};

// ─── Modal: Crear / Modificar Concepto Adicional ────────────────────────────

export function ConceptoAdicionalFormDialog({
  concepto,
  open,
  onOpenChange,
}: {
  concepto: ConceptoAdicionalResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(concepto);
  const crear = useCrearConceptoAdicional();
  const modificar = useModificarConceptoAdicional();
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
  } = useForm<ConceptoAdicionalFormValues>({
    resolver: zodResolver(conceptoAdicionalSchema),
    defaultValues: concepto
      ? {
          nombreConceptoAdicional: concepto.nombreConceptoAdicional,
          descripcionConceptoAdicional: concepto.descripcionConceptoAdicional,
          tipoConcepto: concepto.tipoConcepto,
          baseImponible: concepto.baseImponible,
          valorConcepto: concepto.valorConcepto,
          remunerativo: concepto.remunerativo,
          isGeneral: concepto.isGeneral,
        }
      : {
          nombreConceptoAdicional: "",
          descripcionConceptoAdicional: "",
          isGeneral: false,
        },
  });

  const tipoConcepto = useWatch({ control, name: "tipoConcepto" });
  const esPorcentaje = tipoConcepto === "PORCENTAJE";

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
      nombreConceptoAdicional: values.nombreConceptoAdicional.trim(),
      descripcionConceptoAdicional: values.descripcionConceptoAdicional.trim(),
    };
    try {
      if (isEdit && concepto) {
        await modificar.mutateAsync({ id: concepto.id, payload });
        toast.success("Concepto actualizado correctamente.", {
          description: `"${payload.nombreConceptoAdicional}" ha sido modificado.`,
        });
      } else {
        await crear.mutateAsync(payload);
        toast.success("Concepto creado correctamente.", {
          description: `"${payload.nombreConceptoAdicional}" ha sido agregado al catálogo de conceptos.`,
        });
      }
      handleOpenChange(false);
    } catch (error) {
      const normalized = normalizeApiError(
        error,
        "No se pudo guardar el concepto.",
      );
      if (normalized.status === 409) {
        setError(
          "nombreConceptoAdicional",
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
              <PlusCircle className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {isEdit ? "Modificar Concepto" : "Registrar Nuevo Concepto"}
              </DialogTitle>
              <DialogDescription>
                El nombre debe ser único dentro del catálogo de conceptos.
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
              id="concepto-nombre"
              label="Nombre"
              error={errors.nombreConceptoAdicional?.message}
              required
            >
              <Input
                id="concepto-nombre"
                autoComplete="off"
                placeholder="Ej: Presentismo, Antigüedad, Viáticos..."
                aria-invalid={Boolean(errors.nombreConceptoAdicional)}
                {...register("nombreConceptoAdicional")}
              />
            </FormField>

            <FormField
              icon={AlignLeft}
              id="concepto-descripcion"
              label="Descripción"
              error={errors.descripcionConceptoAdicional?.message}
              required
            >
              <Textarea
                id="concepto-descripcion"
                rows={3}
                aria-invalid={Boolean(errors.descripcionConceptoAdicional)}
                {...register("descripcionConceptoAdicional")}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                icon={Layers}
                id="concepto-tipo"
                label="Tipo de Concepto"
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
                        const tipo = value as TipoConcepto;
                        field.onChange(tipo);
                        setValue("baseImponible", BASE_POR_TIPO[tipo], {
                          shouldValidate: true,
                        });
                      }}
                    >
                      <SelectTrigger
                        id="concepto-tipo"
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
                id="concepto-base"
                label="Base Imponible"
                error={tipoConcepto ? errors.baseImponible?.message : undefined}
                hint={
                  tipoConcepto
                    ? esPorcentaje
                      ? "Un concepto porcentual se calcula sobre el salario básico."
                      : "Un monto fijo no se calcula sobre ninguna base."
                    : undefined
                }
              >
                <Input
                  id="concepto-base"
                  readOnly
                  disabled
                  placeholder="Se define según el tipo"
                  value={
                    tipoConcepto
                      ? BASE_IMPONIBLE_LABELS[BASE_POR_TIPO[tipoConcepto]]
                      : ""
                  }
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                icon={Hash}
                id="concepto-valor"
                label={esPorcentaje ? "Porcentaje (%)" : "Monto ($)"}
                error={errors.valorConcepto?.message}
                hint={
                  esPorcentaje
                    ? "Entre 0,1 y 100, con hasta 2 decimales."
                    : "Mayor a 0, con hasta 2 decimales."
                }
                required
              >
                <Input
                  id="concepto-valor"
                  type="number"
                  step="0.01"
                  min={esPorcentaje ? "0.1" : "0.01"}
                  max={esPorcentaje ? "100" : undefined}
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.valorConcepto)}
                  {...register("valorConcepto", { valueAsNumber: true })}
                />
              </FormField>

              <FormField
                icon={Scale}
                id="concepto-remunerativo"
                label="Carácter"
                error={errors.remunerativo?.message}
                required
              >
                <Controller
                  name="remunerativo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={
                        field.value === undefined ? "" : String(field.value)
                      }
                      onValueChange={(value) => field.onChange(value === "true")}
                    >
                      <SelectTrigger
                        id="concepto-remunerativo"
                        aria-invalid={Boolean(errors.remunerativo)}
                      >
                        <SelectValue placeholder="Seleccioná el carácter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Remunerativo</SelectItem>
                        <SelectItem value="false">No remunerativo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>

            <Controller
              name="isGeneral"
              control={control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <div>
                    <Label
                      htmlFor="concepto-general"
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
                    id="concepto-general"
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

// ─── Modal: Dar de baja Concepto Adicional ──────────────────────────────────

export function BajaConceptoAdicionalDialog({
  concepto,
  onOpenChange,
}: {
  concepto: ConceptoAdicionalResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useBajaConceptoAdicional();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!concepto) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(concepto.id);
      toast.success("Concepto dado de baja.", {
        description: `"${concepto.nombreConceptoAdicional}" ya no se aplicará en las próximas pre-liquidaciones.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo dar de baja el concepto.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(concepto)}
      title="¿Dar de baja este concepto?"
      description={`"${concepto?.nombreConceptoAdicional ?? ""}" dejará de aplicarse en las próximas pre-liquidaciones de recibos.`}
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

// ─── Modal: Reactivar Concepto Adicional ────────────────────────────────────

export function ActivarConceptoAdicionalDialog({
  concepto,
  onOpenChange,
}: {
  concepto: ConceptoAdicionalResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useActivarConceptoAdicional();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!concepto) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(concepto.id);
      toast.success("Concepto reactivado.", {
        description: `"${concepto.nombreConceptoAdicional}" vuelve a estar disponible.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo reactivar el concepto.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(concepto)}
      title="¿Reactivar este concepto?"
      description={`"${concepto?.nombreConceptoAdicional ?? ""}" volverá a aplicarse en las próximas pre-liquidaciones de recibos.`}
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
