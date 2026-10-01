import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../schemas/authSchemas";
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
} from "@/shared/ui";
import { FormField, PasswordField } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { PASSWORD_HINT } from "@/shared/lib/validation/passwordSchema";

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useMutation({ mutationFn: authApi.changePassword });
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
      setSubmitError(undefined);
      mutation.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({ currentPassword, newPassword });
      toast.success("Contraseña actualizada exitosamente.");
      handleOpenChange(false);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo cambiar la contraseña.").message,
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
              <KeyRound className="size-5" />
            </span>
            <div>
              <DialogTitle>Cambiar contraseña</DialogTitle>
              <DialogDescription>
                Actualizá la contraseña de acceso a tu cuenta.
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
            id="current-password"
            label="Contraseña actual"
            error={errors.currentPassword?.message}
            required
          >
            <PasswordField
              id="current-password"
              autoComplete="current-password"
              withIcon={false}
              disabled={mutation.isPending}
              aria-invalid={Boolean(errors.currentPassword)}
              {...register("currentPassword")}
            />
          </FormField>
          <FormField
            id="change-new-password"
            label="Nueva contraseña"
            error={errors.newPassword?.message}
            hint={PASSWORD_HINT}
            required
          >
            <PasswordField
              id="change-new-password"
              autoComplete="new-password"
              withIcon={false}
              disabled={mutation.isPending}
              aria-invalid={Boolean(errors.newPassword)}
              {...register("newPassword")}
            />
          </FormField>
          <FormField
            id="change-confirm-password"
            label="Confirmar nueva contraseña"
            error={errors.confirmPassword?.message}
            required
          >
            <PasswordField
              id="change-confirm-password"
              autoComplete="new-password"
              withIcon={false}
              disabled={mutation.isPending}
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
          </FormField>
          <DialogFooter>
            <Button
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
                "Cambiar contraseña"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
