import { z } from "zod";

// ─── Schema del objeto anidado: Usuario ──────────────────────────────────────

export const rolSchema = z.enum(["ROLE_ADMIN", "ROLE_RRHH", "ROLE_OPERARIO"], {
  error: "Seleccioná un rol.",
});

// ─── Schema principal: Alta / Edición de Empleado ────────────────────────────

export const getEmpleadoFormSchema = (isEdit = false) =>
  z.object({
    dni: z
      .string()
      .trim()
      .min(7, "El DNI debe tener al menos 7 dígitos.")
      .max(8, "El DNI no puede superar los 8 dígitos."),
    cuil: z
      .string()
      .trim()
      .regex(
        /^\d{2}-\d{8}-\d{1}$/,
        "Formato inválido. Esperado: XX-XXXXXXXX-X",
      ),
    fechaNacimiento: z
      .string()
      .trim()
      .min(1, "La fecha de nacimiento es obligatoria."),
    fechaIngreso: z
      .string()
      .trim()
      .min(1, "La fecha de ingreso es obligatoria."),
    nacionalidad: z
      .string()
      .trim()
      .min(1, "La nacionalidad es obligatoria."),
    grupoSanguineo: z
      .string()
      .trim()
      .min(1, "El grupo sanguíneo es obligatorio."),
    domicilio: z
      .string()
      .trim()
      .min(1, "El domicilio es obligatorio."),
    numeroCelular: z
      .string()
      .trim()
      .min(1, "El número de celular es obligatorio."),
    nombreContactoEmergencia: z
      .string()
      .trim()
      .min(1, "El contacto de emergencia es obligatorio."),
    celularContactoEmergencia: z
      .string()
      .trim()
      .min(1, "El celular de emergencia es obligatorio."),
    numeroIeric: z
      .string()
      .trim()
      .min(1, "El número de IERIC es obligatorio."),
    idCategoriaUocra: isEdit
      ? z.number().optional()
      : z
          .number({ error: "Seleccioná una categoría UOCRA." })
          .int()
          .positive("Seleccioná una categoría UOCRA."),
    idZona: isEdit
      ? z.number().optional()
      : z
          .number({ error: "Seleccioná una zona." })
          .int()
          .positive("Seleccioná una zona."),
    genero: z.enum(["MASCULINO", "FEMENINO", "OTRO"], {
      error: "Seleccioná un género.",
    }),
    usuario: z.object({
      nombre: z.string().trim().min(1, "El nombre es obligatorio."),
      apellido: z.string().trim().min(1, "El apellido es obligatorio."),
      email: z.email("Ingresá un correo electrónico válido."),
      password: isEdit
        ? z.string().optional()
        : z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
      rol: isEdit ? rolSchema.optional() : rolSchema,
    }),
  });

export type EmpleadoFormValues = z.infer<ReturnType<typeof getEmpleadoFormSchema>>;


// ─── Schema: Baja de Empleado ───────────────────────────────────────────────

export const bajaEmpleadoSchema = z.object({
  fechaBaja: z
    .string()
    .trim()
    .min(1, "La fecha de baja es obligatoria."),
  motivo: z
    .string()
    .trim()
    .min(1, "El motivo de la baja es obligatorio.")
    .min(5, "El motivo debe contener al menos 5 caracteres."),
});

export type BajaEmpleadoFormValues = z.infer<typeof bajaEmpleadoSchema>;
