import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, UserX } from "lucide-react";
import { toast } from "sonner";
import {
  bajaEmpleadoSchema,
  type BajaEmpleadoFormValues,
} from "../schemas/legajoSchemas";
import { useBajaEmpleado } from "../hooks/useLegajos";
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

interface BajaEmpleadoModalProps {
  empleadoId: number | null;
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  nombreEmpleado?: string;
}

function getTodayDateString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BajaEmpleadoModal({
  empleadoId,
  isOpen,
  open,
  onClose,
  nombreEmpleado,
}: BajaEmpleadoModalProps) {
  const isModalOpen = open ?? isOpen ?? Boolean(empleadoId);
  const mutation = useBajaEmpleado();
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BajaEmpleadoFormValues>({
    resolver: zodResolver(bajaEmpleadoSchema),
    defaultValues: {
      fechaBaja: getTodayDateString(),
      motivo: "",
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({
        fechaBaja: getTodayDateString(),
        motivo: "",
      });
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
        data: values,
      });
      toast.success("Empleado dado de baja exitosamente.");
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo registrar la baja del empleado.").message,
      );
    }
  });

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-error-soft text-error">
              <UserX className="size-5" />
            </span>
            <div>
              <DialogTitle>Dar de baja legajo</DialogTitle>
              <DialogDescription>
                Esta acción registrará la baja laboral del empleado en el sistema.
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
            Estás por dar de baja a{" "}
            <strong className="text-foreground">{nombreEmpleado}</strong>.
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField
            id="fechaBaja"
            label="Fecha de baja"
            error={errors.fechaBaja?.message}
            required
          >
            <Input
              id="fechaBaja"
              type="date"
              aria-invalid={Boolean(errors.fechaBaja)}
              {...register("fechaBaja")}
            />
          </FormField>

          <FormField
            id="motivo"
            label="Motivo de la baja"
            error={errors.motivo?.message}
            required
          >
            <Textarea
              id="motivo"
              rows={3}
              placeholder="Describí el motivo de la baja del empleado..."
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
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  Procesando...
                </>
              ) : (
                "Confirmar Baja"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
