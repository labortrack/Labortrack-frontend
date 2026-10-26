import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, AlertTriangle, Brain, FileText, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import {
  tipoDocumentoCreacionSchema,
  tipoDocumentoModificacionSchema,
  type TipoDocumentoForm,
  CATEGORIAS_RUTEO_VALUES,
} from "../schemas/documentacionSchemas";
import {
  CATEGORIA_RUTEO_LABELS,
  VISIBILIDAD_LABELS,
  type CategoriaRuteo,
  type TipoDocumentoDTO,
  type TipoDocumentoModificacionDto,
  type Visibilidad,
} from "../types/documentacion.types";
import {
  ajustarAlCambiarCategoria,
  describirRegla,
  esRagPermitido,
  esVisibilidadPermitida,
  opcionesPorCategoria,
  opcionesVisibilidad,
  switchRagDeshabilitado,
} from "../utils/categoriaRuteoMatriz";
import {
  useCrearTipoDocumento,
  useModificarTipoDocumento,
} from "../hooks/useDocumentacion";
import { FormField } from "@/shared/components";
import {
  Alert,
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

  // Mensaje del 400 del back (red de seguridad si la combinación pasa igual el formulario).
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [openPrevio, setOpenPrevio] = useState(open);
  if (open !== openPrevio) {
    setOpenPrevio(open);
    if (open) setErrorServidor(null);
  }

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    subscribe,
    formState: { errors, dirtyFields, isSubmitted },
  } = useForm<TipoDocumentoForm>({
    resolver: zodResolver(
      isEditing ? tipoDocumentoModificacionSchema : tipoDocumentoCreacionSchema,
    ),
    // Sin categoría elegida no hay visibilidad posible: ambas arrancan vacías.
    defaultValues: {
      nombre: "",
      descripcion: "",
      procesarEnRag: false,
      categoriaRuteo: "",
      visibilidadDefecto: "",
    },
  });

  const [categoriaRuteo, visibilidadDefecto, procesarEnRag] = useWatch({
    control,
    name: ["categoriaRuteo", "visibilidadDefecto", "procesarEnRag"],
  });
  const admiteRag = opcionesPorCategoria(categoriaRuteo).admiteRag;
  const opcionesDeVisibilidad = opcionesVisibilidad(
    categoriaRuteo,
    visibilidadDefecto,
    isEditing,
  );
  // Tipo existente guardado con una combinación que hoy la matriz no admite.
  const configuracionInvalida =
    isEditing &&
    Boolean(categoriaRuteo) &&
    (!esVisibilidadPermitida(categoriaRuteo, visibilidadDefecto) ||
      !esRagPermitido(categoriaRuteo, procesarEnRag));

  const handleCategoriaChange = (categoria: string) => {
    const ajuste = ajustarAlCambiarCategoria(categoria, getValues());
    const opciones = { shouldDirty: true, shouldValidate: isSubmitted };
    setValue("categoriaRuteo", categoria, opciones);
    setValue("visibilidadDefecto", ajuste.visibilidadDefecto, opciones);
    setValue("procesarEnRag", ajuste.procesarEnRag, opciones);
  };

  // El error del back deja de aplicar en cuanto se edita cualquier campo.
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: () => setErrorServidor(null),
      }),
    [subscribe],
  );

  // Cargar o limpiar valores cuando abre el modal o cambia el tipo a editar
  useEffect(() => {
    if (open) {
      if (tipo) {
        reset({
          nombre: tipo.nombre || "",
          descripcion: tipo.descripcion || "",
          procesarEnRag: Boolean(tipo.procesarEnRag),
          // Se cargan los valores reales aunque la combinación sea inválida: se avisa, no se corrige.
          categoriaRuteo: tipo.categoriaRuteo || "",
          visibilidadDefecto: tipo.visibilidadDefecto || "",
        });
      } else {
        reset({
          nombre: "",
          descripcion: "",
          procesarEnRag: false,
          categoriaRuteo: "",
          visibilidadDefecto: "",
        });
      }
    }
  }, [open, tipo, reset]);

  const onSubmit = async (values: TipoDocumentoForm) => {
    try {
      if (isEditing && tipo?.idTipoDocumento) {
        // Si no se modificó ningún campo en dirtyFields, evitar llamada a API
        if (Object.keys(dirtyFields).length === 0) {
          toast.info("No se detectaron cambios.");
          onOpenChange(false);
          return;
        }

        // Construir payload parcial con solo campos modificados y limpios (trim)
        const payloadParcial: TipoDocumentoModificacionDto = {};

        if (dirtyFields.nombre) {
          const trimmedNombre = values.nombre.trim();
          if (trimmedNombre !== (tipo.nombre ?? "").trim()) {
            payloadParcial.nombre = trimmedNombre;
          }
        }

        if (dirtyFields.descripcion) {
          const trimmedDesc = values.descripcion.trim();
          if (trimmedDesc !== (tipo.descripcion ?? "").trim()) {
            payloadParcial.descripcion = trimmedDesc;
          }
        }

        if (dirtyFields.procesarEnRag) {
          if (values.procesarEnRag !== Boolean(tipo.procesarEnRag)) {
            payloadParcial.procesarEnRag = values.procesarEnRag;
          }
        }

        if (dirtyFields.visibilidadDefecto) {
          if (values.visibilidadDefecto !== tipo.visibilidadDefecto) {
            payloadParcial.visibilidadDefecto = values.visibilidadDefecto;
          }
        }

        // Si tras el trim y comparación no hay cambios efectivos
        if (Object.keys(payloadParcial).length === 0) {
          toast.info("No se detectaron cambios.");
          onOpenChange(false);
          return;
        }

        await modificarMutation.mutateAsync({
          id: tipo.idTipoDocumento,
          data: payloadParcial,
        });
        toast.success(`Tipo "${values.nombre.trim()}" modificado correctamente.`);
      } else {
        await crearMutation.mutateAsync({
          nombre: values.nombre.trim(),
          descripcion: values.descripcion.trim(),
          procesarEnRag: values.procesarEnRag,
          categoriaRuteo: values.categoriaRuteo,
          visibilidadDefecto: values.visibilidadDefecto,
        });
        toast.success(`Tipo "${values.nombre.trim()}" creado exitosamente.`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const { message } = normalizeApiError(
        error,
        isEditing
          ? "No se pudo modificar el tipo de documento."
          : "No se pudo crear el tipo de documento.",
      );
      setErrorServidor(message);
      toast.error(message);
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
          {errorServidor ? (
            <Alert variant="error">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{errorServidor}</span>
            </Alert>
          ) : null}

          {configuracionInvalida ? (
            <Alert variant="warning">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                La configuración actual no es válida: la categoría{" "}
                {CATEGORIA_RUTEO_LABELS[categoriaRuteo as CategoriaRuteo] ||
                  categoriaRuteo}{" "}
                {describirRegla(categoriaRuteo)}. Corregila para poder guardar.
              </span>
            </Alert>
          ) : null}

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
                    disabled={
                      isSubmitting ||
                      switchRagDeshabilitado(categoriaRuteo, field.value)
                    }
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
            {!admiteRag ? (
              <p className="text-xs text-foreground-muted">
                {categoriaRuteo
                  ? "La categoría elegida no admite procesamiento en RAG."
                  : "Elegí una categoría para saber si admite procesamiento en RAG."}
              </p>
            ) : null}
            {errors.procesarEnRag?.message ? (
              <p className="text-xs text-error">{errors.procesarEnRag.message}</p>
            ) : null}
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
                    onValueChange={handleCategoriaChange}
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
            required
            error={errors.visibilidadDefecto?.message}
            hint="Define el nivel de acceso por defecto para los archivos de este tipo."
          >
            <Controller
              control={control}
              name="visibilidadDefecto"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting || opcionesDeVisibilidad.length === 0}
                >
                  <SelectTrigger id="tipo-visibilidadDefecto">
                    <SelectValue
                      placeholder={
                        categoriaRuteo
                          ? "Seleccioná la visibilidad..."
                          : "Elegí primero una categoría"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesDeVisibilidad.map(({ valor, invalida }) => (
                      <SelectItem key={valor} value={valor} disabled={invalida}>
                        <div className="py-0.5">
                          <span className="font-medium text-foreground block">
                            {VISIBILIDAD_LABELS[valor as Visibilidad]?.label || valor}
                            {invalida ? " (actual, no válida)" : ""}
                          </span>
                          <span className="text-xs text-foreground-muted block">
                            {VISIBILIDAD_LABELS[valor as Visibilidad]?.desc}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
