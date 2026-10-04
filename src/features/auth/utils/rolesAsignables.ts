import type { RolNombre } from "../types/auth.types";

// Solo un administrador puede otorgar el rol Administrador; RRHH crea usuarios de
// RRHH u operarios. El backend aplica la misma regla en el alta de usuarios.
export function puedeAsignarRol(rolActor: RolNombre | undefined, rol: RolNombre) {
  return rol !== "ROLE_ADMIN" || rolActor === "ROLE_ADMIN";
}
