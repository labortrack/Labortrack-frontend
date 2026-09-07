import { z } from "zod";

// ─── Tipos de Documento ───────────────────────────────────────────────────────

/** Categorías de Ruteo soportadas por el backend Spring Boot. */
export const CATEGORIAS_RUTEO_VALUES = [
  "LEGAJO_PERSONAL",
  "RECIBOS_SUELDOS",
  "HIGIENE_Y_SEGURIDAD",
  "INSTITUCIONAL",
  "AUSENTISMO",
] as const;

/** Visibilidades soportadas por el backend Spring Boot. */
export const VISIBILIDADES_VALUES = [
  "PUBLICO",
  "RRHH",
  "EMPLEADO",
] as const;

/** Schema Zod para creación de Tipo de Documento (POST). */
export const tipoDocumentoCreacionSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z
    .string()
    .trim()
    .min(3, "La descripción debe tener al menos 3 caracteres.")
    .max(100, "La descripción no puede superar los 100 caracteres."),
  procesarEnRag: z.boolean({
    required_error: "Indicá si el tipo debe procesarse en RAG.",
  }),
  categoriaRuteo: z
    .string()
    .trim()
    .min(1, "Seleccioná una categoría de ruteo."),
  visibilidadDefecto: z
    .string()
    .trim()
    .min(1, "Seleccioná la visibilidad por defecto."),
});

/** Schema Zod para modificación de Tipo de Documento (PUT). */
export const tipoDocumentoModificacionSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(4, "El nombre debe tener al menos 4 caracteres.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  descripcion: z
    .string()
    .trim()
    .min(5, "La descripción debe tener al menos 5 caracteres.")
    .max(255, "La descripción no puede superar los 255 caracteres."),
  procesarEnRag: z.boolean({
    required_error: "Indicá si el tipo debe procesarse en RAG.",
  }),
  categoriaRuteo: z.string().optional(),
  visibilidadDefecto: z.string().optional(),
});

export const tipoDocumentoSchema = tipoDocumentoCreacionSchema;

export type TipoDocumentoForm = z.infer<typeof tipoDocumentoCreacionSchema>;
export type TipoDocumentoModificacionForm = z.infer<typeof tipoDocumentoModificacionSchema>;


// ─── Subida de Documentos ─────────────────────────────────────────────────────

/**
 * Schema base para la subida de un documento.
 *
 * NOTA ARQUITECTÓNICA – Validación estricta de extensión para tipos RAG:
 * La regla de negocio indica que cuando el TipoDocumento tiene
 * `procesarEnRag === true`, el archivo DEBE ser application/pdf.
 *
 * Esta validación NO se puede expresar de forma declarativa aquí porque
 * depende del estado externo (el TipoDocumento seleccionado). En cambio,
 * se implementa en el componente del formulario usando `superRefine`:
 *
 *   const schemaConValidacionRag = uploadDocumentoSchema.superRefine(
 *     (data, ctx) => {
 *       const tipoSeleccionado = tiposDocumento.find(
 *         (t) => t.idTipoDocumento === data.idTipoDocumento,
 *       );
 *       if (
 *         tipoSeleccionado?.procesarEnRag &&
 *         data.file?.type !== "application/pdf"
 *       ) {
 *         ctx.addIssue({
 *           code: z.ZodIssueCode.custom,
 *           path: ["file"],
 *           message:
 *             "Este tipo de documento requiere un archivo en formato PDF.",
 *         });
 *       }
 *     },
 *   );
 *
 * Usá `schemaConValidacionRag` como resolver del formulario en lugar
 * de `uploadDocumentoSchema` directamente.
 */
export const uploadDocumentoSchema = z.object({
  /** Archivo seleccionado por el usuario. */
  file: z
    .instanceof(File, { message: "Seleccioná un archivo." })
    .refine((f) => f.size > 0, "El archivo no puede estar vacío."),

  /** ID del Tipo de Documento al que pertenece este archivo. */
  idTipoDocumento: z
    .number({ required_error: "Seleccioná un tipo de documento." })
    .int()
    .positive("El tipo de documento debe ser válido."),

  /**
   * ID del empleado propietario del documento.
   * Opcional: se omite cuando el documento es institucional (no asociado a persona).
   */
  empleadoId: z.number().int().positive().optional(),

  /**
   * Nombre descriptivo del documento (visible para los usuarios).
   * El backend lo almacena en `nombreDocumento`.
   */
  nombrePersonalizado: z
    .string()
    .trim()
    .min(1, "Ingresá un nombre para el documento."),
});

export type UploadDocumentoForm = z.infer<typeof uploadDocumentoSchema>;
