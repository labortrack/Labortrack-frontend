import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Calculator } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  categoriaZonaSchema,
  type CategoriaZonaFormValues,
} from "../schemas/categoriaZonaSchemas";
import {
  useActivarCategoriaZona,
  useBajaCategoriaZona,
  useCrearCategoriaZona,
  useModificarCategoriaZona,
} from "../hooks/useCategoriaZonas";
import { useCategoriasUocraActivas } from "../hooks/useCategoriasUocra";
import { useZonasActivas } from "../hooks/useZonas";
import type { CategoriaZonaResponseDto } from "../types/categoriaZona.types";
import { esLiquidacionMensual } from "../utils/tipoLiquidacionLabels";
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
import {
  useHistorialAuditoriaDialog,
  HistorialAuditoriaButton,
} from "@/features/auditoria";

// ─── Modal: Crear / Modificar Valor (Zona × Categoría) ──────────────────────

export function CategoriaZonaFormDialog({
  celda,
  open,
  onOpenChange,
}: {
  celda: CategoriaZonaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(celda);
  const { abrirHistorial, renderDialog } = useHistorialAuditoriaDialog();
  const crear = useCrearCategoriaZona();
  const modificar = useModificarCategoriaZona();
  const mutation = isEdit ? modificar : crear;
  const [submitError, setSubmitError] = useState<string>();

  const zonasQuery = useZonasActivas();
  const categoriasQuery = useCategoriasUocraActivas();

  const {
    register,
    control,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoriaZonaFormValues>({
    resolver: zodResolver(categoriaZonaSchema),
    values: {
      idZona: celda?.zonaId ?? 0,
      idCategoriaUOCRA: celda?.categoriaUOCRAId ?? 0,
      valorHoraAdicional: celda?.valorHoraAdicional ?? 0,
      sumaNoRemunerativa: celda?.sumaNoRemunerativa ?? 0,
    },
  });

  const idCategoriaSeleccionada = watch("idCategoriaUOCRA");
  const categoriaSeleccionada = categoriasQuery.data?.find(
    (categoria) => categoria.id === idCategoriaSeleccionada,
  );
  const esMensual = categoriaSeleccionada
    ? esLiquidacionMensual(categoriaSeleccionada.tipoLiquidacion)
    : false;

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
    try {
      if (isEdit && celda) {
        await modificar.mutateAsync({ id: celda.id, payload: values });
        toast.success("Valor actualizado correctamente.");
      } else {
        await crear.mutateAsync(values);
        toast.success("Valor creado correctamente.");
      }
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo guardar el valor.").message,
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Calculator className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {isEdit ? "Modificar Valor" : "Registrar Nuevo Valor"}
              </DialogTitle>
              <DialogDescription>
                Solo puede existir una configuración por combinación de zona y
                categoría.
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              id="categoria-zona-zona"
              label="Zona"
              error={errors.idZona?.message}
              required
            >
              <Controller
                name="idZona"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger id="categoria-zona-zona">
                      <SelectValue placeholder="Seleccioná una zona" />
                    </SelectTrigger>
                    <SelectContent>
                      {(zonasQuery.data ?? []).map((zona) => (
                        <SelectItem key={zona.id} value={String(zona.id)}>
                          {zona.nombreZona}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              id="categoria-zona-categoria"
              label="Categoría UOCRA"
              error={errors.idCategoriaUOCRA?.message}
              required
            >
              <Controller
                name="idCategoriaUOCRA"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger id="categoria-zona-categoria">
                      <SelectValue placeholder="Seleccioná una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categoriasQuery.data ?? []).map((categoria) => (
                        <SelectItem
                          key={categoria.id}
                          value={String(categoria.id)}
                        >
                          {categoria.nombreCategoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField
            id="categoria-zona-adicional"
            label={esMensual ? "Valor Adicional (Mensual)" : "Valor Hora Adicional"}
            error={errors.valorHoraAdicional?.message}
            required
          >
            <Input
              id="categoria-zona-adicional"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              aria-invalid={Boolean(errors.valorHoraAdicional)}
              {...register("valorHoraAdicional", { valueAsNumber: true })}
            />
          </FormField>

          <FormField
            id="categoria-zona-no-remunerativa"
            label="Suma No Remunerativa"
            error={errors.sumaNoRemunerativa?.message}
            required
          >
            <Input
              id="categoria-zona-no-remunerativa"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              aria-invalid={Boolean(errors.sumaNoRemunerativa)}
              {...register("sumaNoRemunerativa", { valueAsNumber: true })}
            />
          </FormField>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              {isEdit && celda && (
                <HistorialAuditoriaButton
                  onAbrir={() =>
                    abrirHistorial(
                      "categoria_zona",
                      celda.id,
                      `${celda.nombreCategoria} - ${celda.nombreZona}`,
                    )
                  }
                  label="Historial"
                />
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
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
            </div>
          </DialogFooter>
        </form>

        {renderDialog()}
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal: Dar de baja Valor ────────────────────────────────────────────────

export function BajaCategoriaZonaDialog({
  celda,
  onOpenChange,
}: {
  celda: CategoriaZonaResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useBajaCategoriaZona();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!celda) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(celda.id);
      toast.success("Valor dado de baja.");
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo dar de baja el valor.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(celda)}
      title="¿Dar de baja este valor?"
      description={`La configuración de "${celda?.nombreCategoria ?? ""}" / "${celda?.nombreZona ?? ""}" dejará de estar disponible. Podés reactivarla más adelante.`}
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

// ─── Modal: Reactivar Valor ──────────────────────────────────────────────────

export function ActivarCategoriaZonaDialog({
  celda,
  onOpenChange,
}: {
  celda: CategoriaZonaResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useActivarCategoriaZona();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!celda) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(celda.id);
      toast.success("Valor reactivado.");
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo reactivar el valor.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(celda)}
      title="¿Reactivar este valor?"
      description={`La configuración de "${celda?.nombreCategoria ?? ""}" / "${celda?.nombreZona ?? ""}" volverá a estar disponible.`}
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
