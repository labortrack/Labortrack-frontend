import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Lock, Upload } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEmpresa, useModificarEmpresa } from "../hooks/useEmpresa";
import {
  LOGO_ACCEPTED_TYPES,
  modificarEmpresaSchema,
  validateLogoFile,
  type ModificarEmpresaForm,
} from "../schemas/empresaSchemas";
import type { Empresa, Rubro } from "../types/empresa.types";
import { RUBRO_OPTIONS } from "../utils/rubroLabels";
import {
  ErrorState,
  FormField,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

function toFormValues(empresa: Empresa): ModificarEmpresaForm {
  return {
    nombreEmpresa: empresa.nombreEmpresa ?? "",
    direccionEmpresa: empresa.direccionEmpresa,
    emailEmpresa: empresa.emailEmpresa,
    nroIericEmpresa: empresa.nroIericEmpresa,
    rubros: empresa.rubros,
  };
}

export default function MiEmpresaPage() {
  const empresaQuery = useEmpresa();
  const mutation = useModificarEmpresa();
  const empresa = empresaQuery.data;

  const [submitError, setSubmitError] = useState<string>();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const objectUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile],
  );

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ModificarEmpresaForm>({
    resolver: zodResolver(modificarEmpresaSchema),
    values: empresa ? toFormValues(empresa) : undefined,
  });

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  if (empresaQuery.isPending) {
    return (
      <Card className="p-12">
        <LoadingState label="Cargando datos de la empresa..." />
      </Card>
    );
  }

  if (empresaQuery.isError || !empresa) {
    return (
      <Card className="p-8">
        <ErrorState
          message={
            normalizeApiError(
              empresaQuery.error,
              "No se pudo cargar la información de la empresa.",
            ).message
          }
          onRetry={() => void empresaQuery.refetch()}
        />
      </Card>
    );
  }

  const logoPreviewUrl = objectUrl ?? empresa.urlLogotipoEmpresa;

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = validateLogoFile(file);
    if (error) {
      setLogoError(error);
      toast.error(error);
      return;
    }
    setLogoError(undefined);
    setLogoFile(file);
  };

  const handleCancel = () => {
    reset(toFormValues(empresa));
    setLogoFile(null);
    setLogoError(undefined);
    setSubmitError(undefined);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({
        dto: {
          nombreEmpresa: values.nombreEmpresa?.trim() || undefined,
          direccionEmpresa: values.direccionEmpresa.trim(),
          emailEmpresa: values.emailEmpresa.trim(),
          nroIericEmpresa: values.nroIericEmpresa.trim(),
          rubros: values.rubros as Rubro[],
        },
        logotipo: logoFile,
      });
      toast.success("Datos de la empresa actualizados correctamente.");
      setLogoFile(null);
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo actualizar la empresa.").message,
      );
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Empresa"
        description="Consultá y editá los datos institucionales de la empresa."
      />

      <form onSubmit={onSubmit} noValidate>
        <Card>
          <CardHeader className="pb-0 border-b-0">
            <Tabs defaultValue="datos">
              <TabsList>
                <TabsTrigger value="datos">Datos empresa</TabsTrigger>
                <TabsTrigger value="avanzado">
                  Configuración avanzada
                </TabsTrigger>
              </TabsList>

              <TabsContent value="datos" className="space-y-4 pb-2">
                {submitError ? (
                  <Alert variant="error">{submitError}</Alert>
                ) : null}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Razón social</Label>
                    <div className="relative">
                      <Input
                        value={empresa.razonSocial}
                        disabled
                        className="cursor-not-allowed bg-subtle pr-8 text-foreground-muted"
                      />
                      <Lock className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-foreground-muted" />
                    </div>
                    <p className="text-[11px] text-foreground-muted">
                      No puede modificarse una vez inicializada la empresa.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>CUIT</Label>
                    <div className="relative">
                      <Input
                        value={empresa.cuit}
                        disabled
                        className="cursor-not-allowed bg-subtle pr-8 text-foreground-muted"
                      />
                      <Lock className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-foreground-muted" />
                    </div>
                    <p className="text-[11px] text-foreground-muted">
                      No puede modificarse una vez inicializada la empresa.
                    </p>
                  </div>

                  <FormField
                    id="mi-empresa-nombre"
                    label="Nombre de fantasía"
                    error={errors.nombreEmpresa?.message}
                  >
                    <Input id="mi-empresa-nombre" {...register("nombreEmpresa")} />
                  </FormField>

                  <FormField
                    id="mi-empresa-email"
                    label="Email de contacto"
                    error={errors.emailEmpresa?.message}
                    required
                  >
                    <Input
                      id="mi-empresa-email"
                      type="email"
                      aria-invalid={Boolean(errors.emailEmpresa)}
                      {...register("emailEmpresa")}
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField
                      id="mi-empresa-direccion"
                      label="Domicilio legal"
                      error={errors.direccionEmpresa?.message}
                      required
                    >
                      <Input
                        id="mi-empresa-direccion"
                        aria-invalid={Boolean(errors.direccionEmpresa)}
                        {...register("direccionEmpresa")}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Logotipo corporativo</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-subtle">
                      {logoPreviewUrl ? (
                        <img
                          src={logoPreviewUrl}
                          alt="Logotipo de la empresa"
                          className="size-full object-contain"
                        />
                      ) : (
                        <Building2 className="size-6 text-foreground-muted" />
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-1.5 size-4" />
                        Cambiar logotipo
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={LOGO_ACCEPTED_TYPES.join(",")}
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                      <p className="mt-1 text-[11px] text-foreground-muted">
                        PNG, JPG o WEBP. Máx. 2MB.
                      </p>
                    </div>
                  </div>
                  {logoError ? (
                    <p className="text-xs font-medium text-error">
                      {logoError}
                    </p>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="avanzado" className="space-y-4 pb-2">
                <FormField
                  id="mi-empresa-ieric"
                  label="Número de IERIC de la empresa"
                  error={errors.nroIericEmpresa?.message}
                  required
                >
                  <Input
                    id="mi-empresa-ieric"
                    aria-invalid={Boolean(errors.nroIericEmpresa)}
                    {...register("nroIericEmpresa")}
                  />
                </FormField>

                <div className="space-y-1.5">
                  <Label>Rubros</Label>
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
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent className="flex justify-end gap-2 border-t border-border bg-subtle">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
