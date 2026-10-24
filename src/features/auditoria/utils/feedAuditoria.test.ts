import { describe, expect, it } from "vitest";
import type { AuditoriaFeedItem } from "../types/auditoria.types";
import { aplanarSinRepetidos } from "./feedAuditoria";

function item(revision: number, entidad: string, entidadId: number): AuditoriaFeedItem {
  return {
    revision,
    fecha: "2026-10-20T12:00:00Z",
    operacion: "MODIFICACION",
    usuario: "admin@labortrack.com",
    rol: "ROLE_ADMIN",
    entidad,
    entidadNombre: entidad,
    entidadId,
    etiqueta: `#${entidadId}`,
  };
}

describe("aplanarSinRepetidos", () => {
  it("concatena las páginas en orden", () => {
    const pages = [
      { items: [item(10, "cuadrilla", 2), item(10, "obra", 1)] },
      { items: [item(9, "cuadrilla", 2)] },
    ];
    expect(aplanarSinRepetidos(pages).map((i) => `${i.revision}-${i.entidad}-${i.entidadId}`))
      .toEqual(["10-cuadrilla-2", "10-obra-1", "9-cuadrilla-2"]);
  });

  it("descarta una fila repetida entre dos páginas", () => {
    const pages = [
      { items: [item(10, "cuadrilla", 2), item(10, "obra", 1)] },
      { items: [item(10, "obra", 1), item(8, "recibo_sueldo", 5)] },
    ];
    expect(aplanarSinRepetidos(pages)).toHaveLength(3);
  });

  it("misma revisión e id en otra entidad no es repetida", () => {
    expect(aplanarSinRepetidos([{ items: [item(10, "cuadrilla", 1), item(10, "obra", 1)] }])).toHaveLength(2);
  });

  it("sin páginas devuelve una lista vacía", () => {
    expect(aplanarSinRepetidos([])).toEqual([]);
  });
});
