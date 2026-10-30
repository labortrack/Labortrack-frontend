import type { RolNombre } from "../types/auth.types";

// Solo un administrador puede otorgar los roles Administrador y Contador; RRHH crea
// usuarios de RRHH u operarios. El backend aplica la misma regla en el alta de usuarios.
export function puedeAsignarRol(rolActor: RolNombre | undefined, rol: RolNombre) {
  const soloAdmin = rol === "ROLE_ADMIN" || rol === "ROLE_CONTADOR";
  return !soloAdmin || rolActor === "ROLE_ADMIN";
}
