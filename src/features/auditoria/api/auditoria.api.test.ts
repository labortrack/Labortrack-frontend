import { describe, expect, it } from "vitest";
import { paramsCambiosGlobales } from "./auditoria.api";

describe("paramsCambiosGlobales", () => {
  it("por defecto no envía excluir ni excluirSistema (aplica las exclusiones del backend)", () => {
    const params = paramsCambiosGlobales({ size: 20 });
    expect(params).toEqual({ size: 20 });
    expect(params).not.toHaveProperty("excluir");
    expect(params).not.toHaveProperty("excluirSistema");
  });

  it("con incluirRuido envía excluir vacío y excluirSistema=false", () => {
    expect(paramsCambiosGlobales({ incluirRuido: true })).toEqual({
      excluir: "",
      excluirSistema: false,
    });
  });

  it("limita size a 50", () => {
    expect(paramsCambiosGlobales({ size: 200 }).size).toBe(50);
  });

  it("pasa el cursor y los filtros, y omite los vacíos", () => {
    expect(paramsCambiosGlobales({
      antesDe: "120:cuadrilla:7",
      usuario: "  ",
      operacion: "CREACION",
      desde: "2026-10-01T03:00:00.000Z",
      hasta: "",
    })).toEqual({
      antesDe: "120:cuadrilla:7",
      operacion: "CREACION",
      desde: "2026-10-01T03:00:00.000Z",
    });
  });

  it("antesDe null (primera página) no se envía", () => {
    expect(paramsCambiosGlobales({ antesDe: null })).toEqual({});
  });
});
