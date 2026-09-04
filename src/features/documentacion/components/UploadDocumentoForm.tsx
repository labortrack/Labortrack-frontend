import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { AlertCircle, FileUp } from "lucide-react";
import { z } from "zod";
import { uploadDocumentoSchema } from "../schemas/documentacionSchemas";
import {
  useTiposDocumentoCompleto,
  useUploadDocumento,
} from "../hooks/useDocumentacion";
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

// ─── Tipos inferidos ──────────────────────────────────────────────────────────

type UploadDocumentoForm = z.infer<typeof uploadDocumentoSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface UploadDocumentoFormProps {
  /** ID del empleado propietario. Omitir para documentos institucionales. */
  empleadoId?: number;
  /** Callback ejecutado luego de una subida exitosa. */
  onSuccess?: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function UploadDocumentoForm({
  empleadoId,
  onSuccess,
}: UploadDocumentoFormProps) {
  const { data: tiposDocumento = [], isLoading: isLoadingTipos } =
    useTiposDocumentoCompleto();

  const uploadMutation = useUploadDocumento();

  // ── Construcción dinámica del resolver ──────────────────────────────────────
  //
  // `superRefine` se aplica al schema base en cada render, tomando como
  // clausura el listado actual de tipos. Cuando cambia `tiposDocumento`,
  // el resolver se recalcula automáticamente gracias a `useMemo`.
  //
  // Regla de negocio:
  //   Si el TipoDocumento seleccionado tiene `procesarEnRag === true`,
  //   el archivo DEBE ser estrictamente 'application/pdf'.

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

  // ── React Hook Form ─────────────────────────────────────────────────────────

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
      empleadoId,
    },
  });

  // Escucha el tipo seleccionado para mostrar el hint de PDF cuando aplica
  const idTipoSeleccionado = useWatch({ control, name: "idTipoDocumento" });
  const tipoActual = tiposDocumento.find(
    (t) => t.idTipoDocumento === idTipoSeleccionado,
  );
  const requierePdf = tipoActual?.procesarEnRag ?? false;

  // ── Submit ──────────────────────────────────────────────────────────────────

  const onSubmit = handleSubmit(async (values) => {
    try {
      await uploadMutation.mutateAsync({
        file: values.file,
        idTipoDocumento: values.idTipoDocumento,
        nombrePersonalizado: values.nombrePersonalizado,
        empleadoId: values.empleadoId,
      });
      toast.success("Documento subido correctamente.");
      reset({ nombrePersonalizado: "", empleadoId });
      onSuccess?.();
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo subir el documento.").message,
      );
    }
  });

  // ── Render ──────────────────────────────────────────────────────────────────

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
                {tiposDocumento.map((tipo) => (
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
