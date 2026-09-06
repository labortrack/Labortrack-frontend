import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  ChevronDown,
  FileUp,
  Loader2,
  UserRound,
  X,
} from "lucide-react";
import { z } from "zod";
import { uploadDocumentoSchema } from "../schemas/documentacionSchemas";
import {
  useBuscarEmpleados,
  useTiposDocumentoCompleto,
  useUploadDocumento,
} from "../hooks/useDocumentacion";
import { FormField } from "@/shared/components";
import {
  Alert,
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { cn } from "@/shared/utils/cn";

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

type UploadDocumentoForm = z.infer<typeof uploadDocumentoSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface UploadDocumentoFormProps {
  /** Callback ejecutado luego de una subida exitosa. */
  onSuccess?: () => void;
}

// ─── Subcomponente: EmpleadoCombobox ─────────────────────────────────────────
//
// Combobox asíncrono que busca empleados con debounce de 300 ms.
// Solo se renderiza para ROLE_ADMIN / ROLE_RRHH.

interface EmpleadoComboboxProps {
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  error?: string;
}

function EmpleadoCombobox({ value, onChange, error }: EmpleadoComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isFetching } = useBuscarEmpleados(search);
  const empleados = data?.content ?? [];

  // Busca el label del empleado seleccionado para mostrarlo en el trigger
  const selectedLabel = value
    ? (empleados.find((e) => e.id === value) ?? null)
    : null;

  // Cuando el popover se cierra, limpia el texto de búsqueda
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id="upload-empleado"
            aria-invalid={Boolean(error)}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-control border border-border bg-card px-3 py-2 text-sm",
              "hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30",
              error && "border-error focus:ring-error/30",
              !value && "text-foreground-muted",
            )}
          >
            <span className="flex min-w-0 items-center gap-2 truncate">
              <UserRound className="size-4 shrink-0 text-foreground-muted" />
              {value && selectedLabel
                ? `${selectedLabel.apellido}, ${selectedLabel.nombre} — DNI ${selectedLabel.dni}`
                : "Buscar empleado..."}
            </span>
            <ChevronDown className="size-4 shrink-0 text-foreground-muted" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          {/* Campo de búsqueda */}
          <div className="border-b border-border px-3 py-2">
            <Input
              autoFocus
              placeholder="Nombre, apellido o DNI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {/* Lista de resultados */}
          <div className="max-h-56 overflow-y-auto">
            {isFetching ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-foreground-muted">
                <Loader2 className="size-4 animate-spin" />
                Buscando...
              </div>
            ) : search.trim().length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-foreground-muted">
                Escribí un nombre o apellido para buscar.
              </p>
            ) : empleados.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-foreground-muted">
                Sin resultados para &quot;{search}&quot;
              </p>
            ) : (
              <>
                {/* Opción para limpiar la selección */}
                {value !== undefined && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground-muted hover:bg-subtle"
                    onClick={() => {
                      onChange(undefined);
                      setOpen(false);
                    }}
                  >
                    <X className="size-4" />
                    Quitar empleado asociado
                  </button>
                )}
                {empleados.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-subtle",
                      value === emp.id && "bg-primary/5 font-medium text-primary",
                    )}
                    onClick={() => {
                      onChange(emp.id);
                      setOpen(false);
                    }}
                  >
                    {value === emp.id ? (
                      <Check className="size-4 shrink-0 text-primary" />
                    ) : (
                      <span className="size-4 shrink-0" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium">
                        {emp.apellido}, {emp.nombre}
                      </span>
                      <span className="ml-2 text-xs text-foreground-muted">
                        DNI {emp.dni} · {emp.estadoActual}
                      </span>
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── Tipos Permitidos para Operarios (Guardarraíl) ───────────────────────────

const TIPOS_PERMITIDOS_OPERARIO = [
  "Certificados Médicos",
  "Certificado Médico",
  "Documentación Personal",
  "Documento de Identidad",
  "Recibo de Sueldo",
  "Licencia Médica",
  "Apto Médico",
  "Constancia",
  "Declaración Jurada",
];

// ─── Componente Principal ─────────────────────────────────────────────────────

export function UploadDocumentoForm({ onSuccess }: UploadDocumentoFormProps) {
  // ── RBAC ───────────────────────────────────────────────────────────────────
  const user = useSessionStore((state) => state.user);
  const esOperario = user?.rol === "ROLE_OPERARIO";
  const esAdminOrRRHH = user?.rol === "ROLE_ADMIN" || user?.rol === "ROLE_RRHH";

  // ── Datos remotos ──────────────────────────────────────────────────────────
  const { data: tiposDocumento = [], isLoading: isLoadingTipos } =
    useTiposDocumentoCompleto();

  const uploadMutation = useUploadDocumento();

  // ── Guardarraíl de tipos según Rol ─────────────────────────────────────────
  // Si es ROLE_OPERARIO, solo mostramos los tipos habilitados para el trabajador.
  // Si es ROLE_ADMIN o ROLE_RRHH, se muestra la lista completa.
  const tiposDisponibles = useMemo(() => {
    if (!esOperario) return tiposDocumento;
    const filtrados = tiposDocumento.filter((tipo) => {
      const nombreNorm = tipo.nombre.toLowerCase().trim();
      const catNorm = tipo.categoriaRuteo?.toLowerCase().trim() || "";
      return (
        TIPOS_PERMITIDOS_OPERARIO.some(
          (permitido) =>
            nombreNorm.includes(permitido.toLowerCase()) ||
            permitido.toLowerCase().includes(nombreNorm),
        ) ||
        catNorm.includes("personal") ||
        catNorm.includes("rrhh")
      );
    });
    return filtrados.length > 0 ? filtrados : tiposDocumento;
  }, [esOperario, tiposDocumento]);

  // ── Construcción dinámica del resolver ─────────────────────────────────────
  //
  // `superRefine` valida que, cuando el tipo seleccionado tiene
  // `procesarEnRag === true`, el archivo sea obligatoriamente PDF.
  //
  const resolverSchema = useMemo(
    () =>
      uploadDocumentoSchema.superRefine((data, ctx) => {
        const tipoSeleccionado = tiposDocumento.find(
          (t) => t.idTipoDocumento === data.idTipoDocumento,
        );

        if (
          tipoSeleccionado?.procesarEnRag &&
          data.file?.type !== "application/pdf"
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["file"],
            message:
              "Los documentos indexables para IA deben ser obligatoriamente formato PDF.",
          });
        }
      }),
    [tiposDocumento],
  );

  // ── React Hook Form ────────────────────────────────────────────────────────

  const {
    register,
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors, submitCount },
  } = useForm<UploadDocumentoForm>({
    resolver: zodResolver(resolverSchema),
    defaultValues: {
      nombrePersonalizado: "",
      empleadoId: esOperario ? user?.empleadoId : undefined,
    },
  });

  // Escucha el tipo seleccionado para mostrar el hint de PDF
  const idTipoSeleccionado = useWatch({ control, name: "idTipoDocumento" });
  const tipoActual = tiposDocumento.find(
    (t) => t.idTipoDocumento === idTipoSeleccionado,
  );
  const requierePdf = tipoActual?.procesarEnRag ?? false;

  // ── Submit ─────────────────────────────────────────────────────────────────
  //
  // Construimos el FormData a mano para enviar multipart/form-data
  // exactamente como lo espera el controlador Spring.
  //
  const onSubmit = handleSubmit(async (values) => {
    const formData = new FormData();
    formData.append("file", values.file);
    formData.append("idTipoDocumento", String(values.idTipoDocumento));
    formData.append("nombrePersonalizado", values.nombrePersonalizado);

    // Lógica de empleadoId según rol:
    // • Operario  → autoasocia su user.empleadoId de sesión.
    // • Admin/RRHH → usa el empleado seleccionado en el combobox (opcional).
    const empleadoIdFinal = esOperario ? user?.empleadoId : values.empleadoId;
    if (empleadoIdFinal !== undefined && empleadoIdFinal !== null) {
      formData.append("empleadoId", String(empleadoIdFinal));
    }

    try {
      await uploadMutation.mutateAsync({
        file: values.file,
        idTipoDocumento: values.idTipoDocumento,
        nombrePersonalizado: values.nombrePersonalizado,
        empleadoId: empleadoIdFinal,
      });
      toast.success("Documento subido correctamente.");
      reset({
        nombrePersonalizado: "",
        empleadoId: esOperario ? user?.empleadoId : undefined,
      });
      onSuccess?.();
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo subir el documento.").message,
      );
    }
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Error global del servidor */}
      {uploadMutation.isError && submitCount > 0 ? (
        <Alert variant="error">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {
            normalizeApiError(
              uploadMutation.error,
              "Ocurrió un error al subir el archivo.",
            ).message
          }
        </Alert>
      ) : null}

      {/* ── Tipo de Documento ── */}
      <FormField
        id="upload-tipo-documento"
        label="Tipo de documento"
        error={errors.idTipoDocumento?.message}
        required
      >
        <Controller
          control={control}
          name="idTipoDocumento"
          render={({ field }) => (
            <Select
              value={field.value != null ? String(field.value) : ""}
              onValueChange={(val) => field.onChange(Number(val))}
              disabled={isLoadingTipos}
            >
              <SelectTrigger
                id="upload-tipo-documento"
                aria-invalid={Boolean(errors.idTipoDocumento)}
              >
                <SelectValue
                  placeholder={
                    isLoadingTipos ? "Cargando tipos..." : "Seleccioná un tipo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tiposDisponibles.map((tipo) => (
                  <SelectItem
                    key={tipo.idTipoDocumento}
                    value={String(tipo.idTipoDocumento)}
                  >
                    {tipo.nombre}
                    {tipo.procesarEnRag ? " — IA" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {/* ── Nombre personalizado ── */}
      <FormField
        id="upload-nombre"
        label="Nombre del documento"
        error={errors.nombrePersonalizado?.message}
        hint="Nombre descriptivo visible para los usuarios."
        required
      >
        <Input
          id="upload-nombre"
          placeholder="Ej.: Contrato de trabajo firmado"
          aria-invalid={Boolean(errors.nombrePersonalizado)}
          {...register("nombrePersonalizado")}
        />
      </FormField>

      {/* ── Empleado Asociado (solo Admin / RRHH) ── */}
      {esAdminOrRRHH && (
        <FormField
          id="upload-empleado"
          label="Empleado asociado"
          error={errors.empleadoId?.message}
          hint="Opcional. Dejá en blanco para documentación institucional."
        >
          <Controller
            control={control}
            name="empleadoId"
            render={({ field }) => (
              <EmpleadoCombobox
                value={field.value}
                onChange={field.onChange}
                error={errors.empleadoId?.message}
              />
            )}
          />
        </FormField>
      )}

      {/* Indicador de empleado auto-asociado para Operario */}
      {esOperario && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2.5 text-sm text-foreground-muted">
          <UserRound className="size-4 shrink-0" />
          El documento se asociará a tu legajo automáticamente.
        </div>
      )}

      {/* ── Archivo ── */}
      <FormField
        id="upload-file"
        label="Archivo"
        error={errors.file?.message}
        hint={
          requierePdf
            ? "⚠ Este tipo requiere un archivo PDF (indexado para IA)."
            : "Formatos aceptados: PDF, DOC, DOCX, XLS, XLSX, imagen, etc."
        }
        required
      >
        <Input
          id="upload-file"
          type="file"
          accept={requierePdf ? "application/pdf" : undefined}
          aria-invalid={Boolean(errors.file)}
          className="cursor-pointer file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setValue("file", file, { shouldValidate: submitCount > 0 });
          }}
        />
      </FormField>

      {/* ── Submit ── */}
      <Button
        type="submit"
        className="w-full"
        disabled={uploadMutation.isPending || isLoadingTipos}
      >
        {uploadMutation.isPending ? (
          <>
            <Spinner className="text-white" />
            Subiendo...
          </>
        ) : (
          <>
            <FileUp className="size-4" />
            Subir documento
          </>
        )}
      </Button>
    </form>
  );
}
