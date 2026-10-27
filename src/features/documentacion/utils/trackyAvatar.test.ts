import { describe, expect, it } from "vitest";
import { estadoAvatarBoton, estadoAvatarTracky } from "./trackyAvatar";

describe("estadoAvatarTracky", () => {
  const base = { visible: true, enVuelo: false, escribiendo: false };

  it("sin chat visible queda inactivo", () => {
    expect(estadoAvatarTracky({ ...base, visible: false })).toBe("inactivo");
  });

  it("con el chat visible y nada en curso queda atento", () => {
    expect(estadoAvatarTracky(base)).toBe("atento");
  });

  it("con una consulta en vuelo piensa", () => {
    expect(estadoAvatarTracky({ ...base, enVuelo: true })).toBe("pensando");
  });

  it("durante el tipeo escribe", () => {
    expect(estadoAvatarTracky({ ...base, escribiendo: true })).toBe("escribiendo");
  });

  it("al terminar el tipeo vuelve a atento", () => {
    const durante = estadoAvatarTracky({ ...base, escribiendo: true });
    const despues = estadoAvatarTracky({ ...base, escribiendo: false });
    expect([durante, despues]).toEqual(["escribiendo", "atento"]);
  });

  it("pensando tiene prioridad sobre escribiendo", () => {
    expect(
      estadoAvatarTracky({ ...base, enVuelo: true, escribiendo: true }),
    ).toBe("pensando");
  });

  it("pensando tiene prioridad aunque el chat no esté visible", () => {
    expect(
      estadoAvatarTracky({ visible: false, enVuelo: true, escribiendo: false }),
    ).toBe("pensando");
  });

  it("sin chat visible no escribe", () => {
    expect(
      estadoAvatarTracky({ visible: false, enVuelo: false, escribiendo: true }),
    ).toBe("inactivo");
  });

  it("recorre el ciclo inactivo → atento → pensando → escribiendo → atento", () => {
    const pasos = [
      { visible: false, enVuelo: false, escribiendo: false },
      { visible: true, enVuelo: false, escribiendo: false },
      { visible: true, enVuelo: true, escribiendo: false },
      { visible: true, enVuelo: false, escribiendo: true },
      { visible: true, enVuelo: false, escribiendo: false },
    ];
    expect(pasos.map(estadoAvatarTracky)).toEqual([
      "inactivo",
      "atento",
      "pensando",
      "escribiendo",
      "atento",
    ]);
  });

  it("una respuesta con error pasa de pensando a atento sin escribir", () => {
    const pasos = [
      { ...base, enVuelo: true },
      { ...base, enVuelo: false, escribiendo: false },
    ];
    expect(pasos.map(estadoAvatarTracky)).toEqual(["pensando", "atento"]);
  });
});

describe("estadoAvatarBoton", () => {
  it("sin consulta en vuelo ni cursor queda inactivo", () => {
    expect(estadoAvatarBoton({ enVuelo: false, hover: false })).toBe("inactivo");
  });

  it("con el cursor encima pasa a atento", () => {
    expect(estadoAvatarBoton({ enVuelo: false, hover: true })).toBe("atento");
  });

  it("con consulta en vuelo piensa", () => {
    expect(estadoAvatarBoton({ enVuelo: true, hover: false })).toBe("pensando");
  });

  it("pensando tiene prioridad sobre el cursor encima", () => {
    expect(estadoAvatarBoton({ enVuelo: true, hover: true })).toBe("pensando");
  });

  it("recorre inactivo → atento → pensando → atento → inactivo", () => {
    const pasos = [
      { enVuelo: false, hover: false },
      { enVuelo: false, hover: true },
      { enVuelo: true, hover: true },
      { enVuelo: false, hover: true },
      { enVuelo: false, hover: false },
    ];
    expect(pasos.map(estadoAvatarBoton)).toEqual([
      "inactivo",
      "atento",
      "pensando",
      "atento",
      "inactivo",
    ]);
  });
});
