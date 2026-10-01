import { z } from "zod";

// Misma política que el backend (@PasswordSegura): mínimo 6 caracteres,
// una mayúscula, una minúscula, un número y un símbolo (cualquier carácter
// que no sea letra, número ni espacio).
export const PASSWORD_MIN_LENGTH = 6;

export const PASSWORD_HINT =
  "Mínimo 6 caracteres, con una mayúscula, una minúscula, un número y un símbolo.";

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  )
  .regex(/\p{Lu}/u, "La contraseña debe incluir al menos una mayúscula.")
  .regex(/\p{Ll}/u, "La contraseña debe incluir al menos una minúscula.")
  .regex(/\p{N}/u, "La contraseña debe incluir al menos un número.")
  .regex(
    /[^\p{L}\p{N}\s]/u,
    "La contraseña debe incluir al menos un símbolo (ej: ! @ # $ %).",
  );
