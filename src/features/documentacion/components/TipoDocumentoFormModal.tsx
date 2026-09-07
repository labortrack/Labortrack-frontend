import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brain, FileText, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  tipoDocumentoCreacionSchema,
  tipoDocumentoModificacionSchema,
  type TipoDocumentoForm,
  CATEGORIAS_RUTEO_VALUES,
  VISIBILIDADES_VALUES,
} from "../schemas/documentacionSchemas";
import {
  CATEGORIA_RUTEO_LABELS,
  VISIBILIDAD_LABELS,
  type CategoriaRuteo,
  type TipoDocumentoDTO,
  type Visibilidad,
} from "../types/documentacion.types";
import {
  useCrearTipoDocumento,
  useModificarTipoDocumento,
} from "../hooks/useDocumentacion";
import { FormField } from "@/shared/components";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Switch,
  Textarea,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";

interface TipoDocumentoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo?: TipoDocumentoDTO | null;
  onSuccess?: () => void;
}

export function TipoDocumentoFormModal({
  open,
  onOpenChange,
  tipo,
  onSuccess,
}: TipoDocumentoFormModalProps) {
  const isEditing = Boolean(tipo && tipo.idTipoDocumento);

  const crearMutation = useCrearTipoDocumento();
  const modificarMutation = useModificarTipoDocumento();
  const isSubmitting = crearMutation.isPending || modificarMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TipoDocumentoForm>({
    resolver: zodResolver(
      isEditing ? tipoDocumentoModificacionSchema : tipoDocumentoCreacionSchema,
    ),
    defaultValues: {
      nombre: "",
      descripcion: "",
      procesarEnRag: false,
      categoriaRuteo: "LEGAJO_PERSONAL",
      visibilidadDefecto: "RRHH",
    },
  });

  // Cargar o limpiar valores cuando abre el modal o cambia el tipo a editar
  useEffect(() => {
    if (open) {
      if (tipo) {
        reset({
          nombre: tipo.nombre || "",
          descripcion: tipo.descripcion || "",
          procesarEnRag: Boolean(tipo.procesarEnRag),
          categoriaRuteo: tipo.categoriaRuteo || "LEGAJO_PERSONAL",
          visibilidadDefecto: tipo.visibilidadDefecto || "RRHH",
        });
      } else {
        reset({
          nombre: "",
          descripcion: "",
          procesarEnRag: false,
          categoriaRuteo: "LEGAJO_PERSONAL",
          visibilidadDefecto: "RRHH",
        });
      }
    }
  }, [open, tipo, reset]);

  const onSubmit = async (values: TipoDocumentoForm) => {
    try {
      if (isEditing && tipo?.idTipoDocumento) {
        await modificarMutation.mutateAsync({
          id: tipo.idTipoDocumento,
          data: {
            nombre: values.nombre.trim(),
            descripcion: values.descripcion.trim(),
            procesarEnRag: values.procesarEnRag,
          },
        });
        toast.success(`Tipo "${values.nombre}" modificado correctamente.`);
      } else {
        await crearMutation.mutateAsync({
          nombre: values.nombre.trim(),
          descripcion: values.descripcion.trim(),
          procesarEnRag: values.procesarEnRag,
          categoriaRuteo: values.categoriaRuteo,
          visibilidadDefecto: values.visibilidadDefecto,
        });
        toast.success(`Tipo "${values.nombre}" creado exitosamente.`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        normalizeApiError(
          error,
          isEditing
            ? "No se pudo modificar el tipo de documento."
            : "No se pudo crear el tipo de documento.",
        ).message,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
        {/* Encabezado */}
        <div className="border-b border-border bg-card px-6 py-5">
          <DialogHeader className="mb-0 border-b-0 pb-0 pr-0">
            <div className="flex items-center gap-3">
              <span
                className={`flex size-10 items-center justify-center rounded-lg ${
                  isEditing
                    ? "bg-primary-soft text-primary"
                    : "bg-primary text-white"
                }`}
              >
                {isEditing ? <FileText className="size-5" /> : <Plus className="size-5" />}
              </span>
              <div>
                <DialogTitle>
                  {isEditing ? "Editar tipo de documento" : "Nuevo tipo de documento"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? `Modificá la configuración del tipo "${tipo?.nombre}".`
                    : "Completá los campos requeridos para dar de alta un nuevo tipo."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {/* Nombre */}
          <FormField
            id="tipo-nombre"
            label="Nombre del tipo"
            required
            error={errors.nombre?.message}
            hint={
              isEditing
                ? "Mínimo 4 caracteres, máximo 100."
                : "Mínimo 3 caracteres, máximo 100."
            }
          >
            <Input
              id="tipo-nombre"
              placeholder="Ej: Contrato de Trabajo, Recibo de Haberes"
              disabled={isSubmitting}
              {...register("nombre")}
            />
          </FormField>

          {/* Descripción */}
          <FormField
            id="tipo-descripcion"
            label="Descripción"
            required
            error={errors.descripcion?.message}
            hint={
              isEditing
                ? "Mínimo 5 caracteres, máximo 255."
                : "Mínimo 3 caracteres, máximo 100."
            }
          >
            <Textarea
              id="tipo-descripcion"
              rows={3}
              placeholder="Describí el propósito y alcance de este tipo de documentación..."
              disabled={isSubmitting}
              {...register("descripcion")}
            />
          </FormField>

          {/* Switch Procesar en RAG (IA) */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Procesar en Motor IA (RAG)
                </span>
              </div>
              <Controller
                control={control}
                name="procesarEnRag"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Al activar esta opción, los documentos asociados serán vectorizados
              e indexados en el asistente de IA para búsqueda inteligente semántica.
              <strong className="block mt-1 text-foreground">
                Nota: Los tipos con RAG solo aceptan archivos en formato PDF.
              </strong>
            </p>
          </div>

          {/* Categoría de Ruteo */}
          <FormField
            id="tipo-categoriaRuteo"
            label="Categoría de Ruteo"
            required={!isEditing}
            error={errors.categoriaRuteo?.message}
            hint={
              isEditing
                ? "La categoría de ruteo no es modificable una vez creado el tipo."
                : "Define la clasificación estructural del documento."
            }
          >
            {isEditing ? (
              <div className="flex h-10 w-full items-center rounded-control border border-border-strong bg-subtle px-3 text-sm text-foreground-muted">
                {CATEGORIA_RUTEO_LABELS[tipo?.categoriaRuteo as CategoriaRuteo] ||
                  tipo?.categoriaRuteo ||
                  "No definida"}
              </div>
            ) : (
              <Controller
                control={control}
                name="categoriaRuteo"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="tipo-categoriaRuteo">
                      <SelectValue placeholder="Seleccioná una categoría..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_RUTEO_VALUES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORIA_RUTEO_LABELS[cat] || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          {/* Visibilidad por Defecto */}
          <FormField
            id="tipo-visibilidadDefecto"
            label="Visibilidad por Defecto"
            required={!isEditing}
            error={errors.visibilidadDefecto?.message}
            hint={
              isEditing
                ? "La visibilidad por defecto se establece durante la creación."
                : "Define el nivel de acceso inicial para los archivos de este tipo."
            }
          >
            {isEditing ? (
              <div className="flex h-10 w-full items-center rounded-control border border-border-strong bg-subtle px-3 text-sm text-foreground-muted">
                {VISIBILIDAD_LABELS[tipo?.visibilidadDefecto as Visibilidad]?.label ||
                  tipo?.visibilidadDefecto ||
                  "No definida"}
              </div>
            ) : (
              <Controller
                control={control}
                name="visibilidadDefecto"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="tipo-visibilidadDefecto">
                      <SelectValue placeholder="Seleccioná la visibilidad..." />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIBILIDADES_VALUES.map((vis) => (
                        <SelectItem key={vis} value={vis}>
                          <div className="py-0.5">
                            <span className="font-medium text-foreground block">
                              {VISIBILIDAD_LABELS[vis]?.label || vis}
                            </span>
                            <span className="text-xs text-foreground-muted block">
                              {VISIBILIDAD_LABELS[vis]?.desc}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  {isEditing ? "Guardando..." : "Creando..."}
                </>
              ) : (
                <>
                  {isEditing ? (
                    <Save className="mr-1.5 size-4" />
                  ) : (
                    <Plus className="mr-1.5 size-4" />
                  )}
                  {isEditing ? "Guardar cambios" : "Crear tipo"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
