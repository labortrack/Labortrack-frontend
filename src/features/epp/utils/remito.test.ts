import { describe, expect, it } from "vitest";
import { nuevoRemitoSchema } from "../schemas/epp.schemas";
import {
  MAX_ITEMS_REMITO,
  eppIdsElegidosEnOtrasFilas,
  formatNumeroRemito,
  resumenItems,
} from "./remito";

describe("formatNumeroRemito", () => {
  it("completa con ceros a la izquierda hasta 6 dígitos", () => {
    expect(formatNumeroRemito(123)).toBe("000123");
    expect(formatNumeroRemito(1234567)).toBe("1234567");
  });
});

describe("resumenItems", () => {
  it("resume un ítem", () => {
    expect(resumenItems([{ nombreEpp: "Casco", cantidad: 1 }])).toBe("Casco x1");
  });

  it("resume varios ítems en el orden recibido", () => {
    expect(
      resumenItems([
        { nombreEpp: "Guantes", cantidad: 2 },
        { nombreEpp: "Casco", cantidad: 1 },
      ]),
    ).toBe("Guantes x2, Casco x1");
  });

  it("sin ítems devuelve texto vacío", () => {
    expect(resumenItems([])).toBe("");
  });
});

describe("eppIdsElegidosEnOtrasFilas", () => {
  it("devuelve los EPP de las otras filas, sin la propia ni las vacías", () => {
    const items = [{ eppId: 1 }, { eppId: 0 }, { eppId: 3 }];
    expect(eppIdsElegidosEnOtrasFilas(items, 0)).toEqual(new Set([3]));
    expect(eppIdsElegidosEnOtrasFilas(items, 1)).toEqual(new Set([1, 3]));
  });
});

describe("nuevoRemitoSchema", () => {
  const remitoValido = {
    empleadoId: 7,
    fechaEntrega: "2026-01-15",
    items: [
      { eppId: 1, cantidad: 2 },
      { eppId: 3, cantidad: 1 },
    ],
  };

  function erroresDe(valor: unknown) {
    const resultado = nuevoRemitoSchema.safeParse(valor);
    return resultado.success ? [] : resultado.error.issues;
  }

  it("acepta un remito válido con varios ítems", () => {
    expect(nuevoRemitoSchema.safeParse(remitoValido).success).toBe(true);
  });

  it("rechaza un remito sin ítems", () => {
    expect(erroresDe({ ...remitoValido, items: [] })[0]?.message).toBe(
      "El remito debe tener al menos un EPP.",
    );
  });

  it("rechaza más de 50 ítems", () => {
    const items = Array.from({ length: MAX_ITEMS_REMITO + 1 }, (_, i) => ({
      eppId: i + 1,
      cantidad: 1,
    }));
    expect(erroresDe({ ...remitoValido, items })[0]?.message).toBe(
      "Un remito admite como máximo 50 EPP distintos.",
    );
  });

  it("acepta exactamente 50 ítems", () => {
    const items = Array.from({ length: MAX_ITEMS_REMITO }, (_, i) => ({
      eppId: i + 1,
      cantidad: 1,
    }));
    expect(nuevoRemitoSchema.safeParse({ ...remitoValido, items }).success).toBe(true);
  });

  it("marca la fila con el EPP repetido", () => {
    const errores = erroresDe({
      ...remitoValido,
      items: [
        { eppId: 1, cantidad: 1 },
        { eppId: 2, cantidad: 1 },
        { eppId: 1, cantidad: 3 },
      ],
    });
    expect(errores).toHaveLength(1);
    expect(errores[0].path).toEqual(["items", 2, "eppId"]);
    expect(errores[0].message).toBe("Este EPP ya está en otra fila.");
  });

  it.each([0, -1, 1.5])("rechaza la cantidad %s", (cantidad) => {
    const errores = erroresDe({
      ...remitoValido,
      items: [{ eppId: 1, cantidad }],
    });
    expect(errores[0]?.path).toEqual(["items", 0, "cantidad"]);
  });

  it("rechaza una fila sin EPP seleccionado", () => {
    const errores = erroresDe({
      ...remitoValido,
      items: [{ eppId: 0, cantidad: 1 }],
    });
    expect(errores[0]?.path).toEqual(["items", 0, "eppId"]);
  });

  it("rechaza un remito sin empleado", () => {
    expect(erroresDe({ ...remitoValido, empleadoId: 0 })[0]?.path).toEqual([
      "empleadoId",
    ]);
  });

  it("rechaza una fecha de entrega futura", () => {
    expect(erroresDe({ ...remitoValido, fechaEntrega: "2999-01-01" })[0]?.message).toBe(
      "La fecha de entrega no puede ser una fecha futura.",
    );
  });
});
