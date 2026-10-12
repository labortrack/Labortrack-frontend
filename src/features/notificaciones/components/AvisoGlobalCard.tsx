import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Megaphone, Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { rolLabels } from "@/features/auth/types/auth.types";
import { ConfirmDialog, FormField } from "@/shared/components";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Input,
  Label,
  Spinner,
  Textarea,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useEnviarAvisoGlobal } from "../hooks/useNotificaciones";
import {
  avisoGlobalSchema,
  ROLES_AVISO,
  type AvisoGlobalForm,
} from "../schemas/avisoGlobalSchema";

const VALORES_INICIALES: AvisoGlobalForm = {
  titulo: "",
  mensaje: "",
  link: "",
  roles: [],
};

export function AvisoGlobalCard() {
  const enviar = useEnviarAvisoGlobal();
  const [pendiente, setPendiente] = useState<AvisoGlobalForm | null>(null);
  const [submitError, setSubmitError] = useState<string>();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AvisoGlobalForm>({
    resolver: zodResolver(avisoGlobalSchema),
    defaultValues: VALORES_INICIALES,
  });

  const destinatarios = (roles: AvisoGlobalForm["roles"]) =>
    roles.length === 0
      ? "todos los usuarios activos"
      : `los usuarios con rol ${roles.map((rol) => rolLabels[rol]).join(", ")}`;

  const confirmar = async () => {
    if (!pendiente) return;
    setSubmitError(undefined);
    try {
      const respuesta = await enviar.mutateAsync({
        titulo: pendiente.titulo,
        mensaje: pendiente.mensaje,
        link: pendiente.link || null,
        roles: pendiente.roles,
      });
      toast.success(`Aviso enviado a ${respuesta.destinatarios} usuario(s).`);
      reset(VALORES_INICIALES);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo enviar el aviso.").message,
      );
    } finally {
      setPendiente(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Megaphone className="size-4 text-primary" />
          Enviar aviso global
        </h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Para comunicar incidentes o novedades a todos los usuarios o a roles
          específicos. Llega a la bandeja de notificaciones de cada usuario.
        </p>
      </CardHeader>
      <CardContent>
        {submitError ? (
          <Alert variant="error" className="mb-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </Alert>
        ) : null}
        <form
          onSubmit={handleSubmit((values) => setPendiente(values))}
          className="space-y-4"
          noValidate
        >
          <FormField
            id="aviso-titulo"
            label="Título"
            error={errors.titulo?.message}
            required
          >
            <Input
              id="aviso-titulo"
              maxLength={150}
              placeholder="Ej.: Sistema en mantenimiento"
              aria-invalid={Boolean(errors.titulo)}
              {...register("titulo")}
            />
          </FormField>
          <FormField
            id="aviso-mensaje"
            label="Mensaje"
            error={errors.mensaje?.message}
            hint="Máximo 1000 caracteres."
            required
          >
            <Textarea
              id="aviso-mensaje"
              rows={4}
              maxLength={1000}
              aria-invalid={Boolean(errors.mensaje)}
              {...register("mensaje")}
            />
          </FormField>
          <FormField
            id="aviso-link"
            label="Link (opcional)"
            error={errors.link?.message}
            hint="Ruta interna a la que lleva el aviso, por ejemplo /documentacion."
          >
            <Input
              id="aviso-link"
              maxLength={300}
              placeholder="/documentacion"
              aria-invalid={Boolean(errors.link)}
              {...register("link")}
            />
          </FormField>
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-foreground">
              Destinatarios
            </legend>
            <p className="text-xs text-foreground-muted">
              Sin selección, el aviso llega a todos los usuarios activos.
            </p>
            <Controller
              control={control}
              name="roles"
              render={({ field }) => (
                <div className="flex flex-wrap gap-4">
                  {ROLES_AVISO.map((rol) => {
                    const id = `aviso-rol-${rol}`;
                    return (
                      <div key={rol} className="flex items-center gap-2">
                        <Checkbox
                          id={id}
                          checked={field.value.includes(rol)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, rol]
                                : field.value.filter((valor) => valor !== rol),
                            )
                          }
                        />
                        <Label htmlFor={id}>{rolLabels[rol]}</Label>
                      </div>
                    );
                  })}
                </div>
              )}
            />
          </fieldset>
          <div className="flex justify-end">
            <Button type="submit" disabled={enviar.isPending}>
              {enviar.isPending ? <Spinner className="text-white" /> : <Send />}
              Enviar aviso
            </Button>
          </div>
        </form>
      </CardContent>
      <ConfirmDialog
        open={pendiente !== null}
        title="Confirmar envío"
        description={
          pendiente
            ? `El aviso "${pendiente.titulo}" se enviará a ${destinatarios(pendiente.roles)}. No se puede deshacer.`
            : ""
        }
        confirmLabel="Enviar"
        pending={enviar.isPending}
        onOpenChange={(open) => {
          if (!open && !enviar.isPending) setPendiente(null);
        }}
        onConfirm={confirmar}
      />
    </Card>
  );
}
