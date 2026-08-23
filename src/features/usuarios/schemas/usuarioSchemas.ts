import { z } from "zod";

export const roleSchema = z.enum(["ROLE_ADMIN", "ROLE_RRHH", "ROLE_OPERARIO"]);

export const userFiltersSchema = z.object({
  nombre: z.string(), apellido: z.string(), email: z.string(), rol: z.union([roleSchema, z.literal("")]),
});

export const createUserSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresá el nombre."),
  apellido: z.string().trim().min(1, "Ingresá el apellido."),
  email: z.email("Ingresá un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  rol: roleSchema,
});

export const editUserSchema = z.object({
  nombre: z.string().trim().min(1, "Ingresá el nombre."),
  apellido: z.string().trim().min(1, "Ingresá el apellido."),
});

export const deactivateUserSchema = z.object({ motivo: z.string().trim().min(1, "Indicá el motivo de la baja.") });

export type UserFiltersForm = z.infer<typeof userFiltersSchema>;
export type CreateUserForm = z.infer<typeof createUserSchema>;
export type EditUserForm = z.infer<typeof editUserSchema>;
export type DeactivateUserForm = z.infer<typeof deactivateUserSchema>;
