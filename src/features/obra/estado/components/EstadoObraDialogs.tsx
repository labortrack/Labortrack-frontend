import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, AlertTriangle, CheckCircle2, Lock, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  createEstadoObraSchema,
  modifyEstadoObraSchema,
  type CreateEstadoObraForm,
  type ModifyEstadoObraForm,
} from "../schemas/estadoObraSchemas";
import {
  useCreateEstadoObra,
  useDeleteEstadoObra,
  useModifyEstadoObra,
} from "../hooks/useEstadosObra";
import type { EstadoObraResponseDto } from "../types/estadoObra.types";
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

// ─── Modal A: Crear Estado de Obra ──────────────────────────────────────────

export function CreateEstadoObraDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useCreateEstadoObra();
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEstadoObraForm>({
    resolver: zodResolver(createEstadoObraSchema),
    defaultValues: {
      nombreEstadoObra: "",
      descripcionEstadoObra: "",
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
    try {
      const created = await mutation.mutateAsync({
        nombreEstadoObra: values.nombreEstadoObra.trim().toUpperCase(),
        descripcionEstadoObra: values.descripcionEstadoObra.trim(),
      });
      toast.success("Estado de Obra creado correctamente.", {
        description: `"${created.nombreEstadoObra}" ha sido agregado al catálogo.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo crear el estado de obra.").message,
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Plus className="size-5" />
            </span>
            <div>
              <DialogTitle>Registrar Nuevo Estado de Obra</DialogTitle>
              <DialogDescription>
                El nombre debe ser único e identificar claramente la etapa del
                proyecto.
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
            id="create-nombre-estado"
            label="Nombre del Estado"
            error={errors.nombreEstadoObra?.message}
            required
          >
            <Input
              id="create-nombre-estado"
              placeholder="Ej: En Fundación, Detenida..."
              aria-invalid={Boolean(errors.nombreEstadoObra)}
              {...register("nombreEstadoObra")}
            />
          </FormField>

          <FormField
            id="create-desc-estado"
            label="Descripción del Estado"
            error={errors.descripcionEstadoObra?.message}
            required
          >
            <Textarea
              id="create-desc-estado"
              rows={3}
              placeholder="Describa brevemente la etapa o reglas de este estado..."
              aria-invalid={Boolean(errors.descripcionEstadoObra)}
              {...register("descripcionEstadoObra")}
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

// ─── Modal B: Modificar Estado de Obra ──────────────────────────────────────

export function EditEstadoObraDialog({
  estado,
  onOpenChange,
}: {
  estado: EstadoObraResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useModifyEstadoObra();
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ModifyEstadoObraForm>({
    resolver: zodResolver(modifyEstadoObraSchema),
    values: {
      descripcionEstadoObra: estado?.descripcionEstadoObra ?? "",
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
    if (!estado) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({
        id: estado.id,
        payload: {
          descripcionEstadoObra: values.descripcionEstadoObra.trim(),
        },
      });
      toast.success("Estado de Obra actualizado correctamente.", {
        description: `"${estado.nombreEstadoObra}" ha sido modificado.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(
          error,
          "No se pudo actualizar el estado de obra.",
        ).message,
      );
    }
  });

  return (
    <Dialog open={Boolean(estado)} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modificar Estado de Obra</DialogTitle>
          <DialogDescription>
            Solo puede editarse la descripción. El nombre del estado es inmutable
            para garantizar la trazabilidad histórica.
          </DialogDescription>
        </DialogHeader>

        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4" />
            {submitError}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nombre del Estado
            </label>
            <div className="relative">
              <Input
                value={estado?.nombreEstadoObra ?? ""}
                disabled
                className="cursor-not-allowed bg-subtle text-foreground-muted pr-9"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
            </div>
            <p className="text-[11px] text-foreground-muted">
              El nombre del estado no puede modificarse para preservar la trazabilidad histórica.
            </p>
          </div>

          <FormField
            id="edit-desc-estado"
            label="Descripción del Estado"
            error={errors.descripcionEstadoObra?.message}
            required
          >
            <Textarea
              id="edit-desc-estado"
              rows={3}
              placeholder="Describa brevemente la etapa o reglas de este estado..."
              aria-invalid={Boolean(errors.descripcionEstadoObra)}
              {...register("descripcionEstadoObra")}
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
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Actualizar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal C: Confirmar Baja Lógica ─────────────────────────────────────────

export function DeactivateEstadoObraDialog({
  estado,
  onOpenChange,
}: {
  estado: EstadoObraResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useDeleteEstadoObra();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!estado) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(estado.id);
      toast.success("Estado de Obra dado de baja.", {
        description: `"${estado.nombreEstadoObra}" ya no estará disponible para nuevas obras.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(
          error,
          "No se pudo dar de baja el estado de obra.",
        ).message,
      );
    }
  };

  return (
    <Dialog open={Boolean(estado)} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-error-soft text-error">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <DialogTitle>¿Deshabilitar Estado de Obra?</DialogTitle>
              {estado ? (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-subtle px-2.5 py-1 text-xs font-semibold text-foreground">
                  <span className="size-1.5 rounded-full bg-foreground-muted" />
                  <span>{estado.nombreEstadoObra}</span>
                </div>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {submitError ? (
          <Alert variant="error" className="mb-2">
            <AlertCircle className="mt-0.5 size-4" />
            {submitError}
          </Alert>
        ) : null}

        <DialogDescription className="text-sm leading-relaxed text-foreground-muted">
          ¿Está seguro de que desea dar de baja este estado? Ya no estará disponible
          para nuevas obras, pero se mantendrá el registro en los proyectos históricos
          que ya lo utilizaron.
        </DialogDescription>

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
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Spinner className="text-white" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                Confirmar Eliminación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
