import { z } from "zod";

// Espeja las validaciones de EmpresaDtoRequest en el backend (CU41).
export const inicializarEmpresaSchema = z.object({
  nombreEmpresa: z.string().trim().optional(),
  razonSocial: z.string().trim().min(1, "La razón social es obligatoria."),
  cuit: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "El CUIT debe tener exactamente 11 dígitos numéricos."),
  direccionEmpresa: z.string().trim().min(1, "La dirección es obligatoria."),
  emailEmpresa: z
    .string()
    .trim()
    .min(1, "El email es obligatorio.")
    .email("El email no tiene un formato válido."),
  nroIericEmpresa: z
    .string()
    .trim()
    .min(1, "El número de IERIC es obligatorio."),
  rubros: z.array(z.string()),
});

export type InicializarEmpresaForm = z.infer<typeof inicializarEmpresaSchema>;

// Espeja las validaciones de EmpresaModificacionDtoRequest en el backend.
// razonSocial y cuit no están acá: RF022 prohíbe modificarlos.
export const modificarEmpresaSchema = z.object({
  nombreEmpresa: z.string().trim().optional(),
  direccionEmpresa: z.string().trim().min(1, "La dirección es obligatoria."),
  emailEmpresa: z
    .string()
    .trim()
    .min(1, "El email es obligatorio.")
    .email("El email no tiene un formato válido."),
  nroIericEmpresa: z
    .string()
    .trim()
    .min(1, "El número de IERIC es obligatorio."),
  rubros: z.array(z.string()),
});

export type ModificarEmpresaForm = z.infer<typeof modificarEmpresaSchema>;

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function validateLogoFile(file: File): string | null {
  if (!LOGO_ACCEPTED_TYPES.includes(file.type)) {
    return "El logotipo debe ser una imagen PNG, JPG o WEBP.";
  }
  if (file.size > LOGO_MAX_BYTES) {
    return "El logotipo no puede superar los 2MB.";
  }
  return null;
}
