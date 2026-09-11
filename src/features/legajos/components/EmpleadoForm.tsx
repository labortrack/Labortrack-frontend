import { useState, useRef, useEffect, useMemo } from "react";
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
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import {
  getEmpleadoFormSchema,
  type EmpleadoFormValues,
} from "../schemas/legajoSchemas";
import {
  useAltaEmpleado,
  useModificarEmpleado,
  useActualizarFotoPerfil,
  useLegajoDetail,
} from "../hooks/useLegajos";
import { GENERO_LABELS } from "../types/legajo.types";
import type { Genero, EmpleadoUpdateDto } from "../types/legajo.types";
import { useCategoriasUocraActivas } from "@/features/cuadroTarifario/hooks/useCategoriasUocra";
import { useZonasActivas } from "@/features/cuadroTarifario/hooks/useZonas";
import { FormField, LoadingState } from "@/shared/components";
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

export interface EmpleadoFormProps {
  empleadoId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EmpleadoForm({
  empleadoId,
  onSuccess,
  onCancel,
}: EmpleadoFormProps) {
  const isEdit = Boolean(empleadoId);

  const { data: empleadoData, isLoading: isLoadingEmpleado } = useLegajoDetail(
    empleadoId,
  );

  const altaMutation = useAltaEmpleado();
  const modificarMutation = useModificarEmpleado();
  const actualizarFotoMutation = useActualizarFotoPerfil();
  const categoriasQuery = useCategoriasUocraActivas();
  const zonasQuery = useZonasActivas();

  const [submitError, setSubmitError] = useState<string>();
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const schema = useMemo(() => getEmpleadoFormSchema(isEdit), [isEdit]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmpleadoFormValues>({
    resolver: zodResolver(schema),
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
      idCategoriaUocra: undefined,
      idZona: undefined,
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

  // Pre-llenar campos en modo edición
  useEffect(() => {
    if (isEdit && empleadoData) {
      reset({
        dni: empleadoData.dni || "",
        cuil: empleadoData.cuil || "",
        fechaNacimiento: empleadoData.fechaNacimiento || "",
        fechaIngreso: empleadoData.fechaIngreso || "",
        nacionalidad: empleadoData.nacionalidad || "",
        grupoSanguineo: empleadoData.grupoSanguineo || "",
        domicilio: empleadoData.domicilio || "",
        numeroCelular: empleadoData.numeroCelular || "",
        nombreContactoEmergencia: empleadoData.nombreContactoEmergencia || "",
        celularContactoEmergencia: empleadoData.celularContactoEmergencia || "",
        numeroIeric: empleadoData.numeroIeric || "",
        idCategoriaUocra: undefined,
        idZona: undefined,
        genero: empleadoData.genero,
        usuario: {
          nombre: empleadoData.nombre || "",
          apellido: empleadoData.apellido || "",
          email: empleadoData.email || "",
          password: "",
          rol: undefined,
        },
      });
    }
  }, [isEdit, empleadoData, reset]);

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

  const isPending =
    altaMutation.isPending ||
    modificarMutation.isPending ||
    actualizarFotoMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(undefined);
    try {
      if (isEdit && empleadoId) {
        // En modo edición solo enviamos los campos permitidos por EmpleadoUpdateDto
        const updatePayload: EmpleadoUpdateDto = {
          nacionalidad: values.nacionalidad,
          domicilio: values.domicilio,
          numeroCelular: values.numeroCelular,
          nombreContactoEmergencia: values.nombreContactoEmergencia,
          celularContactoEmergencia: values.celularContactoEmergencia,
        };

        await modificarMutation.mutateAsync({
          id: empleadoId,
          data: updatePayload,
        });

        if (fotoFile) {
          await actualizarFotoMutation.mutateAsync({
            id: empleadoId,
            foto: fotoFile,
          });
        }

        toast.success("Legajo modificado exitosamente.");
        onSuccess?.();
      } else {
        await altaMutation.mutateAsync({
          datos: values as any,
          foto: fotoFile ?? undefined,
        });
        toast.success("Legajo dado de alta exitosamente.");
        reset();
        handleRemoveFoto();
        onSuccess?.();
      }
    } catch (error) {
      setSubmitError(
        normalizeApiError(
          error,
          isEdit
            ? "No se pudo actualizar el legajo."
            : "No se pudo registrar el alta del empleado.",
        ).message,
      );
    }
  });

  if (isEdit && isLoadingEmpleado) {
    return <LoadingState label="Cargando datos del empleado..." />;
  }

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
      <fieldset className="rounded-card border border-border bg-card p-6 shadow-soft space-y-5">
        <legend className="flex items-center gap-2 px-1 text-base font-semibold text-foreground">
          <User className="size-5 text-primary" />
          {isEdit ? "Cuenta de Usuario (Lectura)" : "Cuenta de Usuario"}
        </legend>
        <p className="text-sm text-foreground-muted">
          {isEdit
            ? "Los datos de acceso y nombre son inmutables desde esta vista."
            : "Datos de autenticación con los que el empleado accederá al sistema."}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="empleado-nombre"
            label="Nombre"
            error={errors.usuario?.nombre?.message}
            required
          >
            <Input
              id="empleado-nombre"
              placeholder="Ej: Juan Carlos"
              disabled={isEdit}
              aria-invalid={Boolean(errors.usuario?.nombre)}
              {...register("usuario.nombre")}
            />
          </FormField>

          <FormField
            id="empleado-apellido"
            label="Apellido"
            error={errors.usuario?.apellido?.message}
            required
          >
            <Input
              id="empleado-apellido"
              placeholder="Ej: Pérez"
              disabled={isEdit}
              aria-invalid={Boolean(errors.usuario?.apellido)}
              {...register("usuario.apellido")}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            id="empleado-email"
            label="Correo Electrónico"
            error={errors.usuario?.email?.message}
            required
          >
            <Input
              id="empleado-email"
              type="email"
              placeholder="juan.perez@empresa.com"
              disabled={isEdit}
              aria-invalid={Boolean(errors.usuario?.email)}
              {...register("usuario.email")}
            />
          </FormField>

          {!isEdit && (
            <FormField
              id="empleado-password"
              label="Contraseña Inicial"
              error={errors.usuario?.password?.message}
              required
            >
              <Input
                id="empleado-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                aria-invalid={Boolean(errors.usuario?.password)}
                {...register("usuario.password")}
              />
            </FormField>
          )}

          {!isEdit && (
            <FormField
              id="empleado-rol"
              label="Rol en el Sistema"
              error={errors.usuario?.rol?.message}
              required
            >
              <Controller
                name="usuario.rol"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) =>
                      field.onChange(val as (typeof ROL_OPTIONS)[number]["value"])
                    }
                  >
                    <SelectTrigger id="empleado-rol">
                      <SelectValue placeholder="Seleccioná un rol" />
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
          )}
        </div>
      </fieldset>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 2 — Datos Personales
      ══════════════════════════════════════════════════════════ */}
      <fieldset className="rounded-card border border-border bg-card p-6 shadow-soft space-y-5">
        <legend className="flex items-center gap-2 px-1 text-base font-semibold text-foreground">
          <UserCheck className="size-5 text-primary" />
          Datos Personales
        </legend>

        {/* Carga de Foto de Perfil */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-border pb-5">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-subtle text-foreground-muted">
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Vista previa"
                className="size-full object-cover"
              />
            ) : (
              <Camera className="size-8 stroke-[1.5]" />
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground block">
              Foto de Perfil {isEdit ? "(Opcional para actualizar)" : "(Opcional)"}
            </label>
            <p className="text-xs text-foreground-muted">
              JPG o PNG. Se subirá automáticamente a MinIO.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {fotoPreview ? "Cambiar Imagen" : "Subir Foto"}
              </Button>
              {fotoPreview ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFoto}
                  className="text-error hover:text-error"
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Quitar
                </Button>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFotoChange}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            id="empleado-dni"
            label="DNI"
            error={errors.dni?.message}
            required
          >
            <Input
              id="empleado-dni"
              placeholder="7 u 8 dígitos"
              maxLength={8}
              disabled={isEdit}
              aria-invalid={Boolean(errors.dni)}
              {...register("dni")}
            />
          </FormField>

          <FormField
            id="empleado-cuil"
            label="CUIL / CUIT"
            error={errors.cuil?.message}
            required
          >
            <Input
              id="empleado-cuil"
              placeholder="20-12345678-9"
              maxLength={13}
              disabled={isEdit}
              aria-invalid={Boolean(errors.cuil)}
              {...register("cuil")}
            />
          </FormField>

          <FormField
            id="empleado-fecha-nacimiento"
            label="Fecha de Nacimiento"
            error={errors.fechaNacimiento?.message}
            required
          >
            <Input
              id="empleado-fecha-nacimiento"
              type="date"
              disabled={isEdit}
              aria-invalid={Boolean(errors.fechaNacimiento)}
              {...register("fechaNacimiento")}
            />
          </FormField>

          <FormField
            id="empleado-genero"
            label="Género"
            error={errors.genero?.message}
            required
          >
            <Controller
              name="genero"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  disabled={isEdit}
                  onValueChange={(val) => field.onChange(val as Genero)}
                >
                  <SelectTrigger id="empleado-genero">
                    <SelectValue placeholder="Seleccioná un género" />
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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            id="empleado-nacionalidad"
            label="Nacionalidad"
            error={errors.nacionalidad?.message}
            required
          >
            <Input
              id="empleado-nacionalidad"
              placeholder="Ej: Argentina"
              aria-invalid={Boolean(errors.nacionalidad)}
              {...register("nacionalidad")}
            />
          </FormField>

          <FormField
            id="empleado-grupo-sanguineo"
            label="Grupo Sanguíneo"
            error={errors.grupoSanguineo?.message}
            required
          >
            <Controller
              name="grupoSanguineo"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  disabled={isEdit}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="empleado-grupo-sanguineo">
                    <SelectValue placeholder="Seleccioná grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRUPO_SANGUINEO_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="empleado-celular"
            label="Número de Celular"
            error={errors.numeroCelular?.message}
            required
          >
            <Input
              id="empleado-celular"
              type="tel"
              placeholder="Ej: +54 9 11 1234-5678"
              aria-invalid={Boolean(errors.numeroCelular)}
              {...register("numeroCelular")}
            />
          </FormField>
        </div>

        <FormField
          id="empleado-domicilio"
          label="Domicilio Real"
          error={errors.domicilio?.message}
          required
        >
          <Input
            id="empleado-domicilio"
            placeholder="Calle, número, piso, departamento, localidad"
            aria-invalid={Boolean(errors.domicilio)}
            {...register("domicilio")}
          />
        </FormField>
      </fieldset>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 3 — Datos Laborales
      ══════════════════════════════════════════════════════════ */}
      <fieldset className="rounded-card border border-border bg-card p-6 shadow-soft space-y-5">
        <legend className="flex items-center gap-2 px-1 text-base font-semibold text-foreground">
          <UserPlus className="size-5 text-primary" />
          Datos Laborales
        </legend>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            id="empleado-ieric"
            label="Número IERIC (Libreta)"
            error={errors.numeroIeric?.message}
            required
          >
            <Input
              id="empleado-ieric"
              placeholder="Ej: 987654321"
              disabled={isEdit}
              aria-invalid={Boolean(errors.numeroIeric)}
              {...register("numeroIeric")}
            />
          </FormField>

          <FormField
            id="empleado-fecha-ingreso"
            label="Fecha de Ingreso a la Empresa"
            error={errors.fechaIngreso?.message}
            required
          >
            <Input
              id="empleado-fecha-ingreso"
              type="date"
              disabled={isEdit}
              aria-invalid={Boolean(errors.fechaIngreso)}
              {...register("fechaIngreso")}
            />
          </FormField>

          {!isEdit ? (
            <>
              <FormField
                id="empleado-categoria-uocra"
                label="Categoría UOCRA"
                error={errors.idCategoriaUocra?.message}
                required
              >
                <Controller
                  name="idCategoriaUocra"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                    >
                      <SelectTrigger id="empleado-categoria-uocra">
                        <SelectValue placeholder="Seleccioná una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categoriasQuery.data ?? []).map((categoria) => (
                          <SelectItem
                            key={categoria.id}
                            value={String(categoria.id)}
                          >
                            {categoria.nombreCategoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                id="empleado-zona"
                label="Zona"
                error={errors.idZona?.message}
                required
              >
                <Controller
                  name="idZona"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) =>
                        field.onChange(val ? Number(val) : undefined)
                      }
                    >
                      <SelectTrigger id="empleado-zona">
                        <SelectValue placeholder="Seleccioná una zona" />
                      </SelectTrigger>
                      <SelectContent>
                        {(zonasQuery.data ?? []).map((zona) => (
                          <SelectItem key={zona.id} value={String(zona.id)}>
                            {zona.nombreZona}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </>
          ) : null}
        </div>
      </fieldset>

      {/* ══════════════════════════════════════════════════════════
          SECCIÓN 4 — Contactos de Emergencia
      ══════════════════════════════════════════════════════════ */}
      <fieldset className="rounded-card border border-border bg-card p-6 shadow-soft space-y-5">
        <legend className="flex items-center gap-2 px-1 text-base font-semibold text-foreground">
          <HeartPulse className="size-5 text-error" />
          Contacto de Emergencia
        </legend>
        <p className="text-sm text-foreground-muted">
          Persona a contactar ante cualquier eventualidad o accidente laboral.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="empleado-contacto-emergencia"
            label="Nombre Completo"
            error={errors.nombreContactoEmergencia?.message}
            required
          >
            <Input
              id="empleado-contacto-emergencia"
              placeholder="Ej: María Marta Álvarez"
              aria-invalid={Boolean(errors.nombreContactoEmergencia)}
              {...register("nombreContactoEmergencia")}
            />
          </FormField>

          <FormField
            id="empleado-celular-emergencia"
            label="Celular de Emergencia"
            error={errors.celularContactoEmergencia?.message}
            required
          >
            <Input
              id="empleado-celular-emergencia"
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
            disabled={isPending}
          >
            <X className="size-4" />
            Cancelar
          </Button>
        ) : null}

        {!isEdit && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset();
              handleRemoveFoto();
              setSubmitError(undefined);
            }}
            disabled={isPending}
          >
            <Trash2 className="size-4" />
            Limpiar
          </Button>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="size-4 mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="size-4" />
              {isEdit ? "Guardar Cambios" : "Dar de Alta"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
