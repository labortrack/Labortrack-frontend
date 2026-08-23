import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { AuthCard } from "../components/AuthCard";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas/authSchemas";
import { Alert, Button, Spinner } from "@/shared/ui";
import { FormField, PasswordField } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const mutation = useMutation({ mutationFn: authApi.resetPassword });
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "", confirmPassword: "" } });

  const onSubmit = handleSubmit(async ({ password }) => {
    setSubmitError(undefined);
    if (!token) { setSubmitError("El enlace es inválido o no contiene un token."); return; }
    try { await mutation.mutateAsync({ token, newPassword: password }); setSuccess(true); }
    catch (error) { setSubmitError(normalizeApiError(error, "El enlace es inválido o ha expirado. Solicitá uno nuevo.").message); }
  });

  return <AuthCard>{success ? <div className="space-y-5 text-center"><Alert variant="success" className="flex-col items-center"><CheckCircle2 className="size-8" /><strong>¡Contraseña restablecida!</strong><span>Ya podés iniciar sesión con tus nuevas credenciales.</span></Alert><Button asChild size="lg" className="w-full"><Link to="/login">Ir a iniciar sesión</Link></Button></div> : <form onSubmit={onSubmit} className="space-y-5" noValidate><div className="text-center"><h2 className="text-xl font-medium">Nueva contraseña</h2><p className="mt-1 text-sm text-foreground-muted">Ingresá una nueva clave para acceder al sistema.</p></div>{!token || submitError ? <Alert variant="error"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{submitError || "El enlace es inválido o no contiene un token."}</span></Alert> : null}<FormField id="new-password" label="Nueva contraseña" error={errors.password?.message} required><PasswordField id="new-password" autoComplete="new-password" disabled={!token || mutation.isPending} aria-invalid={Boolean(errors.password)} {...register("password")} /></FormField><FormField id="confirm-password" label="Confirmar nueva contraseña" error={errors.confirmPassword?.message} required><PasswordField id="confirm-password" autoComplete="new-password" disabled={!token || mutation.isPending} aria-invalid={Boolean(errors.confirmPassword)} {...register("confirmPassword")} /></FormField><Button type="submit" size="lg" className="w-full" disabled={!token || mutation.isPending}>{mutation.isPending ? <><Spinner className="text-white" />Actualizando...</> : "Restablecer contraseña"}</Button><Button asChild variant="link" className="mx-auto flex"><Link to="/login"><ArrowLeft />Volver al inicio de sesión</Link></Button></form>}</AuthCard>;
}
