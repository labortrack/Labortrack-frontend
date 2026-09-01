import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertCircle,
  Camera,
  HeartPulse,
  Save,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import {
  altaEmpleadoSchema,
  rolSchema,
  type AltaEmpleadoFormValues,
} from "../schemas/legajoSchemas";
import { useAltaEmpleado } from "../hooks/useLegajos";
import { GENERO_LABELS } from "../types/legajo.types";
import type { Genero } from "../types/legajo.types";
import { FormField } from "@/shared/components";
import {
  Alert,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

const GRUPO_SANGUINEO_OPTIONS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

const GENERO_OPTIONS: Array<{ value: Genero; label: string }> = (
  Object.keys(GENERO_LABELS) as Genero[]
).map((key) => ({ value: key, label: GENERO_LABELS[key] }));

const ROL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "ROLE_OPERARIO", label: "Operario" },
  { value: "ROLE_RRHH", label: "Recursos Humanos" },
  { value: "ROLE_ADMIN", label: "Administrador" },
];

interface AltaEmpleadoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AltaEmpleadoForm({ onSuccess, onCancel }: AltaEmpleadoFormProps) {
  const mutation = useAltaEmpleado();
  const [submitError, setSubmitError] = useState<string>();
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AltaEmpleadoFormValues>({
    resolver: zodResolver(altaEmpleadoSchema),
    defaultValues: {
      dni: "",
      cuil: "",
      fechaNacimiento: "",
      fechaIngreso: "",
      nacionalidad: "",
      grupoSanguineo: "",
      domicilio: "",
      numeroCelular: "",
      nombreContactoEmergencia: "",
      celularContactoEmergencia: "",
      numeroIeric: "",
      genero: undefined,
      usuario: {
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        rol: undefined,
      },
    },
  });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFoto = () => {
    setFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      await mutation.mutateAsync({
        datos: values,
        foto: fotoFile ?? undefined,
      });
      toast.success("Legajo dado de alta exitosamente.");
      reset();
      handleRemoveFoto();
      onSuccess?.();
    } catch (error) {
      setSubmitError(
        normalizeApiError(error, "No se pudo registrar el alta del empleado.")
          .message,
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {/* ── Error general de submit ─────────────────────────────── */}
      {submitError ? (
        <Alert variant="error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {submitError}
        </Alert>
      ) : null}

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 1 — Datos del Usuario (cuenta de acceso)
         ══════════════════════════════════════════════════════════ */}
      <fieldset className="rounded-card border border-border bg-card p-5 shadow-soft space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <UserPlus className="size-5 text-primary" />
          <legend className="text-base font-semibold text-foreground">
            Datos de la Cuenta
          </legend>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="alta-usuario-nombre"
            label="Nombre"
            error={errors.usuario?.nombre?.message}
            required
          >
            <Input
              id="alta-usuario-nombre"
              placeholder="Ej: Carlos Eduardo"
              aria-invalid={Boolean(errors.usuario?.nombre)}
              {...register("usuario.nombre")}
            />
          </FormField>

          <FormField
            id="alta-usuario-apellido"
            label="Apellido"
            error={errors.usuario?.apellido?.message}
            required
          >
            <Input
              id="alta-usuario-apellido"
              placeholder="Ej: Álvarez"
              aria-invalid={Boolean(errors.usuario?.apellido)}
              {...register("usuario.apellido")}
            />
          </FormField>

          <FormField
            id="alta-usuario-email"
            label="Correo Electrónico"
            error={errors.usuario?.email?.message}
            required
          >
            <Input
              id="alta-usuario-email"
              type="email"
              placeholder="empleado@empresa.com"
              aria-invalid={Boolean(errors.usuario?.email)}
              {...register("usuario.email")}
            />
          </FormField>

          <FormField
            id="alta-usuario-password"
            label="Contraseña"
            error={errors.usuario?.password?.message}
            required
            hint="Mínimo 6 caracteres"
          >
            <Input
              id="alta-usuario-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.usuario?.password)}
              {...register("usuario.password")}
            />
          </FormField>

          <FormField
            id="alta-usuario-rol"
            label="Rol del Sistema"
            error={errors.usuario?.rol?.message}
            required
          >
            <Controller
              control={control}
              name="usuario.rol"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="alta-usuario-rol"
                    aria-invalid={Boolean(errors.usuario?.rol)}
                  >
                    <SelectValue placeholder="Seleccionar rol..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ROL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
      </fieldset>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 2 — Datos Personales del Empleado
         ══════════════════════════════════════════════════════════ */}
      <fieldset className="rounded-card border border-border bg-card p-5 shadow-soft space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <User className="size-5 text-primary" />
          <legend className="text-base font-semibold text-foreground">
            Datos Personales
          </legend>
        </div>

        {/* Foto de perfil */}
        <div className="flex items-center gap-4">
          <div className="relative size-20 shrink-0">
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Vista previa"
                className="size-20 rounded-full object-cover border-2 border-primary/20 shadow-soft"
              />
            ) : (
              <div className="size-20 flex items-center justify-center rounded-full bg-subtle border-2 border-dashed border-border-strong text-foreground-muted">
                <Camera className="size-6" />
              </div>
            )}
            {fotoPreview ? (
              <button
                type="button"
                onClick={handleRemoveFoto}
                className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-error text-white shadow-soft transition hover:bg-error-strong"
                aria-label="Quitar foto"
              >
                <X className="size-3" />
              </button>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground-muted">
              Foto de perfil (opcional)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4" />
              {fotoPreview ? "Cambiar Foto" : "Seleccionar Foto"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            id="alta-dni"
            label="DNI"
            error={errors.dni?.message}
            required
            hint="Entre 7 y 8 dígitos"
          >
            <Input
              id="alta-dni"
              placeholder="Ej: 32145678"
              aria-invalid={Boolean(errors.dni)}
              {...register("dni")}
            />
          </FormField>

          <FormField
            id="alta-cuil"
            label="CUIL"
            error={errors.cuil?.message}
            required
            hint="Formato: XX-XXXXXXXX-X"
          >
            <Input
              id="alta-cuil"
              placeholder="Ej: 20-32145678-9"
              aria-invalid={Boolean(errors.cuil)}
              {...register("cuil")}
            />
          </FormField>

          <FormField
            id="alta-numero-ieric"
            label="Número IERIC"
            error={errors.numeroIeric?.message}
            required
          >
            <Input
              id="alta-numero-ieric"
              placeholder="Ej: IER-987654"
              aria-invalid={Boolean(errors.numeroIeric)}
              {...register("numeroIeric")}
            />
          </FormField>

          <FormField
            id="alta-fecha-nacimiento"
            label="Fecha de Nacimiento"
            error={errors.fechaNacimiento?.message}
            required
          >
            <Input
              id="alta-fecha-nacimiento"
              type="date"
              aria-invalid={Boolean(errors.fechaNacimiento)}
              {...register("fechaNacimiento")}
            />
          </FormField>

          <FormField
            id="alta-genero"
            label="Género"
            error={errors.genero?.message}
            required
          >
            <Controller
              control={control}
              name="genero"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="alta-genero"
                    aria-invalid={Boolean(errors.genero)}
                  >
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GENERO_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="alta-nacionalidad"
            label="Nacionalidad"
            error={errors.nacionalidad?.message}
            required
          >
            <Input
              id="alta-nacionalidad"
              placeholder="Ej: Argentina"
              aria-invalid={Boolean(errors.nacionalidad)}
              {...register("nacionalidad")}
            />
          </FormField>

          <FormField
            id="alta-grupo-sanguineo"
            label="Grupo Sanguíneo"
            error={errors.grupoSanguineo?.message}
            required
          >
            <Controller
              control={control}
              name="grupoSanguineo"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="alta-grupo-sanguineo"
                    aria-invalid={Boolean(errors.grupoSanguineo)}
                  >
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GRUPO_SANGUINEO_OPTIONS.map((gs) => (
                      <SelectItem key={gs} value={gs}>
                        {gs}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="alta-domicilio"
            label="Domicilio"
            error={errors.domicilio?.message}
            required
          >
            <Input
              id="alta-domicilio"
              placeholder="Ej: Av. Belgrano 1420, CABA"
              aria-invalid={Boolean(errors.domicilio)}
              {...register("domicilio")}
            />
          </FormField>

          <FormField
            id="alta-celular"
            label="Teléfono Celular"
            error={errors.numeroCelular?.message}
            required
          >
            <Input
              id="alta-celular"
              type="tel"
              placeholder="Ej: +54 9 11 4567-8901"
              aria-invalid={Boolean(errors.numeroCelular)}
              {...register("numeroCelular")}
            />
          </FormField>

          <FormField
            id="alta-fecha-ingreso"
            label="Fecha de Ingreso"
            error={errors.fechaIngreso?.message}
            required
          >
            <Input
              id="alta-fecha-ingreso"
              type="date"
              aria-invalid={Boolean(errors.fechaIngreso)}
              {...register("fechaIngreso")}
            />
          </FormField>
        </div>
      </fieldset>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 3 — Contacto de Emergencia
         ══════════════════════════════════════════════════════════ */}
      <fieldset className="rounded-card border border-border bg-card p-5 shadow-soft space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <HeartPulse className="size-5 text-error" />
          <legend className="text-base font-semibold text-foreground">
            Contacto de Emergencia
          </legend>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="alta-contacto-emergencia"
            label="Nombre Completo"
            error={errors.nombreContactoEmergencia?.message}
            required
          >
            <Input
              id="alta-contacto-emergencia"
              placeholder="Ej: María Marta Álvarez"
              aria-invalid={Boolean(errors.nombreContactoEmergencia)}
              {...register("nombreContactoEmergencia")}
            />
          </FormField>

          <FormField
            id="alta-celular-emergencia"
            label="Celular de Emergencia"
            error={errors.celularContactoEmergencia?.message}
            required
          >
            <Input
              id="alta-celular-emergencia"
              type="tel"
              placeholder="Ej: +54 9 11 9876-5432"
              aria-invalid={Boolean(errors.celularContactoEmergencia)}
              {...register("celularContactoEmergencia")}
            />
          </FormField>
        </div>
      </fieldset>

      {/* ── Botones de acción ─────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            <X className="size-4" />
            Cancelar
          </Button>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            reset();
            handleRemoveFoto();
            setSubmitError(undefined);
            mutation.reset();
          }}
          disabled={mutation.isPending}
        >
          <Trash2 className="size-4" />
          Limpiar
        </Button>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Spinner className="size-4" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="size-4" />
              Dar de Alta
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
