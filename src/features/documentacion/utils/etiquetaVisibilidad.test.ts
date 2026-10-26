import { describe, expect, it } from "vitest";
import { VISIBILIDAD_LABELS } from "../types/documentacion.types";
import { etiquetaVisibilidad } from "./etiquetaVisibilidad";

describe("etiquetaVisibilidad (Documento360Modal)", () => {
  it.each([null, undefined, ""])("sin visibilidad (%s) muestra \"Sin visibilidad\"", (valor) => {
    expect(etiquetaVisibilidad(valor)).toBe("Sin visibilidad");
  });

  it.each(["PUBLICO", "RRHH", "EMPLEADO"] as const)(
    "%s muestra la etiqueta de VISIBILIDAD_LABELS",
    (valor) => {
      expect(etiquetaVisibilidad(valor)).toBe(VISIBILIDAD_LABELS[valor].label);
    },
  );

  it("un valor desconocido se muestra tal cual", () => {
    expect(etiquetaVisibilidad("OTRA")).toBe("OTRA");
  });
});
