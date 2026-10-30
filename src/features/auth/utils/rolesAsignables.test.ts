import { describe, expect, it } from "vitest";
import { puedeAsignarRol } from "./rolesAsignables";

describe("puedeAsignarRol", () => {
  it("el administrador puede asignar cualquier rol", () => {
    expect(puedeAsignarRol("ROLE_ADMIN", "ROLE_ADMIN")).toBe(true);
    expect(puedeAsignarRol("ROLE_ADMIN", "ROLE_CONTADOR")).toBe(true);
    expect(puedeAsignarRol("ROLE_ADMIN", "ROLE_RRHH")).toBe(true);
    expect(puedeAsignarRol("ROLE_ADMIN", "ROLE_OPERARIO")).toBe(true);
  });

  it("RRHH asigna RRHH u operario, pero no administrador ni contador", () => {
    expect(puedeAsignarRol("ROLE_RRHH", "ROLE_RRHH")).toBe(true);
    expect(puedeAsignarRol("ROLE_RRHH", "ROLE_OPERARIO")).toBe(true);
    expect(puedeAsignarRol("ROLE_RRHH", "ROLE_ADMIN")).toBe(false);
    expect(puedeAsignarRol("ROLE_RRHH", "ROLE_CONTADOR")).toBe(false);
  });
});
