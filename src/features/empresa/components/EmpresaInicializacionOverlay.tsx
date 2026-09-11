import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, UploadCloud } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogout } from "@/features/auth/hooks/useAuthActions";
import { useInicializarEmpresa } from "../hooks/useEmpresa";
import {
  inicializarEmpresaSchema,
  validateLogoFile,
  type InicializarEmpresaForm,
} from "../schemas/empresaSchemas";
import type { Rubro } from "../types/empresa.types";
import { RUBRO_OPTIONS } from "../utils/rubroLabels";
import { FormField } from "@/shared/components";
import { Alert, Button, Checkbox, Input, Spinner } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";

// RF016/RF017: modal bloqueante (no Dialog de Radix a propósito: no debe poder
// cerrarse con Escape ni clic afuera) que se muestra sobre el dashboard mientras
// la empresa no esté inicializada. Solo lo ve un ROLE_ADMIN (ver EmpresaInicializacionGate).
export function EmpresaInicializacionOverlay() {
  const navigate = useNavigate();
  const logout = useLogout();
  const mutation = useInicializarEmpresa();
  const [submitError, setSubmitError] = useState<string>();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string>();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InicializarEmpresaForm>({
    resolver: zodResolver(inicializarEmpresaSchema),
    defaultValues: {
      nombreEmpresa: "",
      razonSocial: "",
      cuit: "",
      direccionEmpresa: "",
      emailEmpresa: "",
      nroIericEmpresa: "",
      rubros: [],
    },
  });

  const logoPreviewUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile],
  );

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  const aplicarArchivo = (file: File) => {
    const error = validateLogoFile(file);
    if (error) {
      setLogoError(error);
      toast.error(error);
      return;
    }
    setLogoError(undefined);
    setLogoFile(file);
    toast.success("Logotipo cargado correctamente.");
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) aplicarArchivo(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) aplicarArchivo(file);
  };

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      /* La sesión se limpia en onSettled. */
    }
    navigate("/login", { replace: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({
        dto: {
          nombreEmpresa: values.nombreEmpresa?.trim() || undefined,
          razonSocial: values.razonSocial.trim(),
          cuit: values.cuit.trim(),
          direccionEmpresa: values.direccionEmpresa.trim(),
          emailEmpresa: values.emailEmpresa.trim(),
          nroIericEmpresa: values.nroIericEmpresa.trim(),
          rubros: values.rubros as Rubro[],
        },
        logotipo: logoFile,
      });
      toast.success("Empresa inicializada correctamente.");
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo inicializar la empresa.").message,
      );
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-card border border-border bg-card shadow-floating">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            Configuración inicial de la empresa
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Completá los datos institucionales de la empresa para desbloquear
            el sistema. Este paso se realiza una única vez.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {submitError ? <Alert variant="error">{submitError}</Alert> : null}

            <FormField
              id="wizard-razon-social"
              label="Razón social"
              error={errors.razonSocial?.message}
              required
            >
              <Input
                id="wizard-razon-social"
                aria-invalid={Boolean(errors.razonSocial)}
                {...register("razonSocial")}
              />
            </FormField>

            <FormField
              id="wizard-cuit"
              label="CUIT"
              error={errors.cuit?.message}
              hint="Solo números, 11 dígitos."
              required
            >
              <Input
                id="wizard-cuit"
                inputMode="numeric"
                maxLength={11}
                aria-invalid={Boolean(errors.cuit)}
                {...register("cuit")}
              />
            </FormField>

            <FormField
              id="wizard-direccion"
              label="Domicilio legal"
              error={errors.direccionEmpresa?.message}
              required
            >
              <Input
                id="wizard-direccion"
                aria-invalid={Boolean(errors.direccionEmpresa)}
                {...register("direccionEmpresa")}
              />
            </FormField>

            <FormField
              id="wizard-email"
              label="Email de contacto"
              error={errors.emailEmpresa?.message}
              required
            >
              <Input
                id="wizard-email"
                type="email"
                aria-invalid={Boolean(errors.emailEmpresa)}
                {...register("emailEmpresa")}
              />
            </FormField>

            <FormField
              id="wizard-ieric"
              label="Número de IERIC de la empresa"
              error={errors.nroIericEmpresa?.message}
              required
            >
              <Input
                id="wizard-ieric"
                aria-invalid={Boolean(errors.nroIericEmpresa)}
                {...register("nroIericEmpresa")}
              />
            </FormField>

            <FormField
              id="wizard-nombre"
              label="Nombre de fantasía"
              error={errors.nombreEmpresa?.message}
            >
              <Input id="wizard-nombre" {...register("nombreEmpresa")} />
            </FormField>

            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">Rubros</span>
              <Controller
                control={control}
                name="rubros"
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {RUBRO_OPTIONS.map((option) => {
                      const checked = field.value?.includes(option.value) ?? false;
                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 rounded-control border border-border px-3 py-2 text-sm text-foreground"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              const current = field.value ?? [];
                              field.onChange(
                                value
                                  ? [...current, option.value]
                                  : current.filter((v) => v !== option.value),
                              );
                            }}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-sm font-medium text-foreground">
                Logotipo de la empresa (opcional)
              </span>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-4 transition",
                  logoFile
                    ? "justify-start text-left"
                    : "flex-col justify-center py-6 text-center",
                  dragActive
                    ? "border-primary bg-primary-soft"
                    : logoError
                      ? "border-error bg-error-soft"
                      : logoFile
                        ? "border-success bg-success-soft"
                        : "border-border-strong bg-subtle",
                )}
              >
                {logoFile && logoPreviewUrl ? (
                  <>
                    <img
                      src={logoPreviewUrl}
                      alt="Vista previa del logotipo seleccionado"
                      className="size-12 shrink-0 rounded-md border border-border bg-card object-contain"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {logoFile.name}
                      </p>
                      <p className="text-[11px] text-success">
                        Logotipo cargado correctamente. Click para cambiarlo.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-6 text-foreground-muted" />
                    <p className="text-sm text-foreground">
                      Arrastrá o hacé clic para seleccionar
                    </p>
                    <p className="text-[11px] text-foreground-muted">
                      PNG, JPG o WEBP. Máx. 2MB.
                    </p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
              {logoError ? (
                <p className="text-xs font-medium text-error">{logoError}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border bg-subtle px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              disabled={logout.isPending || mutation.isPending}
            >
              <LogOut className="mr-1.5 size-4" />
              Cerrar sesión
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner className="text-white" />
                  Guardando...
                </>
              ) : (
                "Guardar e inicializar"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
