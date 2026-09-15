import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zonaSchema, type ZonaFormValues } from "../schemas/zonaSchemas";
import {
  useActivarZona,
  useBajaZona,
  useCrearZona,
  useModificarZona,
} from "../hooks/useZonas";
import type { ZonaResponseDto } from "../types/zona.types";
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

// ─── Modal: Crear / Modificar Zona ──────────────────────────────────────────

export function ZonaFormDialog({
  zona,
  open,
  onOpenChange,
}: {
  zona: ZonaResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(zona);
  const crear = useCrearZona();
  const modificar = useModificarZona();
  const mutation = isEdit ? modificar : crear;
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ZonaFormValues>({
    resolver: zodResolver(zonaSchema),
    values: {
      nombreZona: zona?.nombreZona ?? "",
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
    const payload = { nombreZona: values.nombreZona.trim() };
    try {
      if (isEdit && zona) {
        await modificar.mutateAsync({ id: zona.id, payload });
        toast.success("Zona actualizada correctamente.", {
          description: `"${payload.nombreZona}" ha sido modificada.`,
        });
      } else {
        await crear.mutateAsync(payload);
        toast.success("Zona creada correctamente.", {
          description: `"${payload.nombreZona}" ha sido agregada al cuadro tarifario.`,
        });
      }
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo guardar la zona.").message,
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <MapPin className="size-5" />
            </span>
            <div>
              <DialogTitle>
                {isEdit ? "Modificar Zona" : "Registrar Nueva Zona"}
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
            id="zona-nombre"
            label="Nombre de la Zona"
            error={errors.nombreZona?.message}
            required
          >
            <Input
              id="zona-nombre"
              placeholder="Ej: Gran Mendoza, Zona Este..."
              aria-invalid={Boolean(errors.nombreZona)}
              {...register("nombreZona")}
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

// ─── Modal: Dar de baja Zona ────────────────────────────────────────────────

export function BajaZonaDialog({
  zona,
  onOpenChange,
}: {
  zona: ZonaResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useBajaZona();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!zona) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(zona.id);
      toast.success("Zona dada de baja.", {
        description: `"${zona.nombreZona}" ya no estará disponible para nuevas configuraciones.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo dar de baja la zona.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(zona)}
      title="¿Dar de baja esta zona?"
      description={`"${zona?.nombreZona ?? ""}" dejará de estar disponible para nuevas configuraciones del cuadro tarifario. Podés reactivarla más adelante.`}
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

// ─── Modal: Reactivar Zona ──────────────────────────────────────────────────

export function ActivarZonaDialog({
  zona,
  onOpenChange,
}: {
  zona: ZonaResponseDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useActivarZona();
  const [submitError, setSubmitError] = useState<string>();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (!zona) return;
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync(zona.id);
      toast.success("Zona reactivada.", {
        description: `"${zona.nombreZona}" vuelve a estar disponible.`,
      });
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo reactivar la zona.").message,
      );
    }
  };

  return (
    <ConfirmDialog
      open={Boolean(zona)}
      title="¿Reactivar esta zona?"
      description={`"${zona?.nombreZona ?? ""}" volverá a estar disponible para nuevas configuraciones del cuadro tarifario.`}
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
