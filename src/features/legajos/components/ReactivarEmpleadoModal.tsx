import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  reactivarEmpleadoSchema,
  type ReactivarEmpleadoFormValues,
} from "../schemas/legajoSchemas";
import { useReactivarEmpleado } from "../hooks/useLegajos";
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

interface ReactivarEmpleadoModalProps {
  empleadoId: number | null;
  onClose: () => void;
  nombreEmpleado?: string;
}

export function ReactivarEmpleadoModal({
  empleadoId,
  onClose,
  nombreEmpleado,
}: ReactivarEmpleadoModalProps) {
  const isModalOpen = Boolean(empleadoId);
  const mutation = useReactivarEmpleado();
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReactivarEmpleadoFormValues>({
    resolver: zodResolver(reactivarEmpleadoSchema),
    defaultValues: { motivo: "" },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({ motivo: "" });
      setSubmitError(undefined);
      mutation.reset();
      onClose();
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!empleadoId) return;
    setSubmitError(undefined);

    try {
      await mutation.mutateAsync({
        id: empleadoId,
        payload: values,
      });
      toast.success("Empleado reactivado exitosamente.");
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo reactivar el empleado.").message,
      );
    }
  });

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-success-soft text-success">
              <UserCheck className="size-5" />
            </span>
            <div>
              <DialogTitle>Reactivar legajo</DialogTitle>
              <DialogDescription>
                El empleado volverá al estado Activo en el sistema.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submitError ? (
          <Alert variant="error" className="mb-2">
            <AlertCircle className="mt-0.5 size-4" />
            {submitError}
          </Alert>
        ) : null}

        {nombreEmpleado ? (
          <p className="text-sm text-foreground-muted">
            Estás por reactivar a{" "}
            <strong className="text-foreground">{nombreEmpleado}</strong>.
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField
            id="reactivar-motivo"
            label="Motivo de la reactivación"
            error={errors.motivo?.message}
            required
          >
            <Textarea
              id="reactivar-motivo"
              rows={3}
              placeholder="Ej: Reincorporación de personal..."
              aria-invalid={Boolean(errors.motivo)}
              {...register("motivo")}
            />
          </FormField>

          <DialogFooter className="gap-2 sm:gap-0">
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
                  <Spinner className="size-4 mr-2" />
                  Procesando...
                </>
              ) : (
                "Confirmar Reactivación"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
