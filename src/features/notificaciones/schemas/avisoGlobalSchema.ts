import { z } from "zod";

export const ROLES_AVISO = ["ROLE_ADMIN", "ROLE_RRHH", "ROLE_OPERARIO", "ROLE_CONTADOR"] as const;

export const avisoGlobalSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(150, "El título no puede superar los 150 caracteres."),
  mensaje: z
    .string()
    .trim()
    .min(1, "El mensaje es obligatorio.")
    .max(1000, "El mensaje no puede superar los 1000 caracteres."),
  link: z
    .string()
    .trim()
    .max(300, "El link no puede superar los 300 caracteres.")
    .refine(
      (valor) => valor === "" || /^\/(?!\/)/.test(valor),
      "Debe ser una ruta interna que empiece con '/', por ejemplo /documentacion.",
    ),
  roles: z.array(z.enum(ROLES_AVISO)),
});

export type AvisoGlobalForm = z.infer<typeof avisoGlobalSchema>;
