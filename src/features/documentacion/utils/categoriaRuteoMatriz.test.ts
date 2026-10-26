import { describe, expect, it } from "vitest";
import {
  tipoDocumentoCreacionSchema,
  tipoDocumentoModificacionSchema,
} from "../schemas/documentacionSchemas";
import {
  ajustarAlCambiarCategoria,
  opcionesPorCategoria,
  opcionesVisibilidad,
  switchRagDeshabilitado,
} from "./categoriaRuteoMatriz";

describe("opcionesPorCategoria", () => {
  it.each(["RECIBOS_SUELDOS", "LEGAJO_PERSONAL", "AUSENTISMO", "HIGIENE_Y_SEGURIDAD"])(
    "%s admite solo EMPLEADO, preseleccionado, sin RAG",
    (categoria) => {
      expect(opcionesPorCategoria(categoria)).toEqual({
        visibilidades: ["EMPLEADO"],
        admiteRag: false,
        visibilidadPorDefecto: "EMPLEADO",
      });
    },
  );

  it("INSTITUCIONAL admite PUBLICO o RRHH, sin preselección, con RAG", () => {
    expect(opcionesPorCategoria("INSTITUCIONAL")).toEqual({
      visibilidades: ["PUBLICO", "RRHH"],
      admiteRag: true,
      visibilidadPorDefecto: "",
    });
  });

  it("sin categoría elegida no ofrece visibilidades ni RAG", () => {
    expect(opcionesPorCategoria("")).toEqual({
      visibilidades: [],
      admiteRag: false,
      visibilidadPorDefecto: "",
    });
  });

  it("una categoría desconocida no ofrece nada", () => {
    expect(opcionesPorCategoria("toString").visibilidades).toEqual([]);
  });
});

describe("ajustarAlCambiarCategoria", () => {
  it("al pasar a una categoría sin RAG resetea visibilidad y apaga el RAG", () => {
    expect(
      ajustarAlCambiarCategoria("LEGAJO_PERSONAL", {
        visibilidadDefecto: "PUBLICO",
        procesarEnRag: true,
      }),
    ).toEqual({ visibilidadDefecto: "EMPLEADO", procesarEnRag: false });
  });

  it("al pasar a INSTITUCIONAL desde EMPLEADO deja la visibilidad sin elegir", () => {
    expect(
      ajustarAlCambiarCategoria("INSTITUCIONAL", {
        visibilidadDefecto: "EMPLEADO",
        procesarEnRag: false,
      }),
    ).toEqual({ visibilidadDefecto: "", procesarEnRag: false });
  });

  it("conserva la visibilidad y el RAG si siguen siendo válidos", () => {
    expect(
      ajustarAlCambiarCategoria("INSTITUCIONAL", {
        visibilidadDefecto: "RRHH",
        procesarEnRag: true,
      }),
    ).toEqual({ visibilidadDefecto: "RRHH", procesarEnRag: true });
  });
});

describe("opcionesVisibilidad", () => {
  it("en el alta nunca agrega la opción inválida", () => {
    expect(opcionesVisibilidad("LEGAJO_PERSONAL", "RRHH", false)).toEqual([
      { valor: "EMPLEADO", invalida: false },
    ]);
  });

  it("en edición agrega la visibilidad actual no válida", () => {
    expect(opcionesVisibilidad("LEGAJO_PERSONAL", "RRHH", true)).toEqual([
      { valor: "EMPLEADO", invalida: false },
      { valor: "RRHH", invalida: true },
    ]);
  });

  it("en edición la opción inválida desaparece al elegir una válida", () => {
    expect(opcionesVisibilidad("LEGAJO_PERSONAL", "EMPLEADO", true)).toEqual([
      { valor: "EMPLEADO", invalida: false },
    ]);
  });
});

describe("switchRagDeshabilitado", () => {
  it("con RAG encendido en una categoría que no lo admite queda habilitado para apagarlo", () => {
    expect(switchRagDeshabilitado("RECIBOS_SUELDOS", true)).toBe(false);
  });

  it("una vez apagado, se deshabilita", () => {
    expect(switchRagDeshabilitado("RECIBOS_SUELDOS", false)).toBe(true);
  });

  it("sin categoría queda deshabilitado", () => {
    expect(switchRagDeshabilitado("", false)).toBe(true);
  });

  it("en INSTITUCIONAL queda habilitado", () => {
    expect(switchRagDeshabilitado("INSTITUCIONAL", false)).toBe(false);
  });
});

describe("schemas de TipoDocumento", () => {
  const base = { nombre: "Contrato", descripcion: "Contrato laboral" };

  it("el alta acepta una combinación válida", () => {
    const resultado = tipoDocumentoCreacionSchema.safeParse({
      ...base,
      categoriaRuteo: "INSTITUCIONAL",
      visibilidadDefecto: "PUBLICO",
      procesarEnRag: true,
    });
    expect(resultado.success).toBe(true);
  });

  it("el alta rechaza RAG en una categoría que no lo admite", () => {
    const resultado = tipoDocumentoCreacionSchema.safeParse({
      ...base,
      categoriaRuteo: "AUSENTISMO",
      visibilidadDefecto: "EMPLEADO",
      procesarEnRag: true,
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues.map((i) => i.path)).toEqual([["procesarEnRag"]]);
  });

  it("el alta sin categoría pide la categoría sin repetir el error de visibilidad", () => {
    const resultado = tipoDocumentoCreacionSchema.safeParse({
      ...base,
      categoriaRuteo: "",
      visibilidadDefecto: "",
      procesarEnRag: false,
    });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues.map((i) => i.path)).toEqual([
      ["categoriaRuteo"],
      ["visibilidadDefecto"],
    ]);
  });

  it("editar un tipo con configuración inválida bloquea el guardado y mantiene la visibilidad actual visible", () => {
    const tipoViejo = {
      ...base,
      categoriaRuteo: "LEGAJO_PERSONAL",
      visibilidadDefecto: "RRHH",
      procesarEnRag: false,
    };
    const resultado = tipoDocumentoModificacionSchema.safeParse(tipoViejo);
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues.map((i) => i.path)).toEqual([["visibilidadDefecto"]]);
    expect(
      opcionesVisibilidad(tipoViejo.categoriaRuteo, tipoViejo.visibilidadDefecto, true),
    ).toContainEqual({ valor: "RRHH", invalida: true });
  });

  it("la edición se puede guardar una vez corregida la configuración", () => {
    const resultado = tipoDocumentoModificacionSchema.safeParse({
      ...base,
      categoriaRuteo: "LEGAJO_PERSONAL",
      visibilidadDefecto: "EMPLEADO",
      procesarEnRag: false,
    });
    expect(resultado.success).toBe(true);
  });
});
