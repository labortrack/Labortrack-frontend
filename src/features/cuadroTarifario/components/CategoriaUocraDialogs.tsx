import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Tag } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  categoriaUocraSchema,
  type CategoriaUocraFormValues,
} from "../schemas/categoriaUocraSchemas";
import {
  useActivarCategoriaUocra,
  useBajaCategoriaUocra,
  useCrearCategoriaUocra,
  useModificarCategoriaUocra,
} from "../hooks/useCategoriasUocra";
import type { CategoriaUocraResponseDto } from "../types/categoriaUocra.types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

const TIPO_LIQUIDACION_OPTIONS = [
  { value: "POR_HORA", label: "Por Hora" },
  { value: "MENSUAL", label: "Mensual" },
] as const;

// ─── Modal: Crear / Modificar Categoría UOCRA ───────────────────────────────

export function CategoriaUocraFormDialog({
  categoria,
  open,
  onOpenChange,
}: {
  categoria: CategoriaUocraResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(categoria);
  const crear = useCrearCategoriaUocra();
  const modificar = useModificarCategoriaUocra();
  const mutation = isEdit ? modificar : crear;
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoriaUocraFormValues>({
    resolver: zodResolver(categoriaUocraSchema),
    values: {
      nombreCategoria: categoria?.nombreCategoria ?? "",
      tipoLiquidacion: categoria?.tipoLiquidacion ?? "POR_HORA",
      valorHoraBasico: categoria?.valorHoraBasico ?? 0,
    },
  });

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
      nombreCategoria: values.nombreCategoria.trim(),
      tipoLiquidacion: values.tipoLiquidacion,
      valorHoraBasico: values.valorHoraBasico,
    };
    try {
      if (isEdit && categoria) {
        await modificar.mutateAsync({ id: categoria.id, payload });
        toast.success("Categoría UOCRA actualizada correctamente.", {
          description: `"${payload.nombreCategoria}" ha sido modificada.`,
        });
      } else {
        await crear.mutateAsync(payload);
        toast.success("Categoría UOCRA creada correctamente.", {
          description: `"${payload.nombreCategoria}" ha sido agregada al cuadro tarifario.`,
        });
      }
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo guardar la categoría.").message,
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Tag className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {isEdit ? "Modificar Categoría UOCRA" : "Registrar Nueva Categoría UOCRA"}
              </DialogTitle>
              <DialogDescription>
                El nombre debe ser único dentro del cuadro tarifario UOCRA.
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
          <FormField
            id="categoria-nombre"
            label="Nombre de la Categoría"
            error={errors.nombreCategoria?.message}
            required
          >
            <Input
              id="categoria-nombre"
              placeholder="Ej: Oficial Especializado, Oficial, Medio Oficial..."
              aria-invalid={Boolean(errors.nombreCategoria)}
              {...register("nombreCategoria")}
            />
          </FormField>

          <FormField
            id="categoria-tipo-liquidacion"
            label="Tipo de Liquidación"
            error={errors.tipoLiquidacion?.message}
            required
          >
            <Controller
              name="tipoLiquidacion"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="categoria-tipo-liquidacion">
                    <SelectValue placeholder="Seleccioná un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_LIQUIDACION_OPTIONS.map((opt) => (
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
            id="categoria-valor-hora-basico"
            label="Valor Hora Básico"
            error={errors.valorHoraBasico?.message}
            required
          >
            <Input
              id="categoria-valor-hora-basico"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              aria-invalid={Boolean(errors.valorHoraBasico)}
              {...register("valorHoraBasico", { valueAsNumber: true })}
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

// ─── Modal: Dar de baja Categoría UOCRA ─────────────────────────────────────

export function BajaCategoriaUocraDialog({
  categoria,
  onOpenChange,
}: {
  categoria: CategoriaUocraResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useBajaCategoriaUocra();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!categoria) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(categoria.id);
      toast.success("Categoría UOCRA dada de baja.", {
        description: `"${categoria.nombreCategoria}" ya no estará disponible para nuevas configuraciones.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo dar de baja la categoría.")
          .message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(categoria)}
      title="¿Dar de baja esta categoría?"
      description={`"${categoria?.nombreCategoria ?? ""}" dejará de estar disponible para nuevas configuraciones del cuadro tarifario. Podés reactivarla más adelante.`}
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

// ─── Modal: Reactivar Categoría UOCRA ───────────────────────────────────────

export function ActivarCategoriaUocraDialog({
  categoria,
  onOpenChange,
}: {
  categoria: CategoriaUocraResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useActivarCategoriaUocra();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!categoria) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(categoria.id);
      toast.success("Categoría UOCRA reactivada.", {
        description: `"${categoria.nombreCategoria}" vuelve a estar disponible.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo reactivar la categoría.")
          .message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(categoria)}
      title="¿Reactivar esta categoría?"
      description={`"${categoria?.nombreCategoria ?? ""}" volverá a estar disponible para nuevas configuraciones del cuadro tarifario.`}
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
