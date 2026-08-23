import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { AlertCircle, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { env } from "@/app/config/env";
import { useGoogleLogin, useLogin } from "../hooks/useAuthActions";
import { loginSchema, type LoginFormValues } from "../schemas/authSchemas";
import { AuthCard } from "../components/AuthCard";
import { Alert, Button, Input, Separator, Spinner } from "@/shared/ui";
import { FormField, PasswordField } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const googleLogin = useGoogleLogin();
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const pending = login.isPending || googleLogin.isPending;

  const redirectTo =
    (location.state as { from?: string } | null)?.from || "/dashboard";
  const finishLogin = () => navigate(redirectTo, { replace: true });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await login.mutateAsync(values);
      finishLogin();
    } catch (error) {
      setSubmitError(
        normalizeApiError(
          error,
          "El correo electrónico o la contraseña son incorrectos.",
        ).message,
      );
    }
  });

  const onGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setSubmitError("Google no devolvió una credencial válida.");
      return;
    }
    setSubmitError(undefined);
    try {
      await googleLogin.mutateAsync({ idToken: response.credential });
      finishLogin();
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo iniciar sesión con Google.")
          .message,
      );
    }
  };

  return (
    <AuthCard>
      <div className="space-y-5">
        {env.googleClientId ? (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={() =>
                setSubmitError("No se pudo iniciar sesión con Google.")
              }
              text="continue_with"
              shape="rectangular"
              width="350"
            />
          </div>
        ) : (
          <Alert variant="warning">
            Google Login no está configurado. Definí VITE_GOOGLE_CLIENT_ID para
            habilitarlo.
          </Alert>
        )}
        <div className="relative flex items-center">
          <Separator />
          <span className="absolute left-1/2 -translate-x-1/2 bg-card px-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            o
          </span>
        </div>
        {submitError ? (
          <Alert variant="error">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </Alert>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <FormField
            id="email"
            label="Correo electrónico"
            error={errors.email?.message}
            required
          >
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className="pl-10"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
            </div>
          </FormField>
          <FormField
            id="password"
            label="Contraseña"
            error={errors.password?.message}
            required
          >
            <PasswordField
              id="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
          </FormField>
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Spinner className="text-white" />
                Ingresando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
        <p className="border-t border-border pt-4 text-center text-[11px] leading-4 text-foreground-muted">
          El acto de ingresar y operar en la plataforma constituye la aceptación
          total de los Términos y Condiciones de LaborTrack.
        </p>
      </div>
    </AuthCard>
  );
}
