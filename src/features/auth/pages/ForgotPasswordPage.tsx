import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { AuthCard } from "../components/AuthCard";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/authSchemas";
import { Alert, Button, Input, Spinner } from "@/shared/ui";
import { FormField } from "@/shared/components";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const mutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSettled: () => setSent(true),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <AuthCard showBrand={false}>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-medium text-foreground">
          Restablecer contraseña
        </h1>
        <p className="mt-2 text-sm leading-5 text-foreground-muted">
          Ingresá tu correo electrónico para recibir las instrucciones de
          recuperación.
        </p>
      </div>
      {sent ? (
        <div className="space-y-5">
          <Alert variant="success">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <span>
              Si el correo está registrado, se enviaron las instrucciones para
              restablecer la contraseña.
            </span>
          </Alert>
          <Button asChild className="w-full" size="lg">
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          noValidate
        >
          <FormField
            id="recovery-email"
            label="Correo electrónico de legajo"
            error={errors.email?.message}
            required
          >
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <Input
                id="recovery-email"
                type="email"
                autoComplete="email"
                className="pl-10"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </div>
          </FormField>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Spinner className="text-white" />
                Enviando...
              </>
            ) : (
              "Enviar instrucciones"
            )}
          </Button>
          <Button asChild variant="link" className="mx-auto flex">
            <Link to="/login">
              <ArrowLeft />
              Volver al inicio de sesión
            </Link>
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
