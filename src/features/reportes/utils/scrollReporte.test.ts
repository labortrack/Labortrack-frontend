import { describe, expect, it } from "vitest";
import { opcionesScrollFiltros } from "./scrollReporte";

describe("opcionesScrollFiltros", () => {
  it("con movimiento permitido desplaza suave y lo mínimo", () => {
    expect(opcionesScrollFiltros(false)).toEqual({ behavior: "smooth", block: "nearest" });
  });

  it("con movimiento reducido desplaza instantáneo y lo mínimo", () => {
    expect(opcionesScrollFiltros(true)).toEqual({ behavior: "auto", block: "nearest" });
  });
});
