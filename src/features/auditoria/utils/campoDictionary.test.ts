import { describe, expect, it } from "vitest";
import { etiquetaValorEnum, formatNombreCampo, formatValorAuditoria } from "./campoDictionary";

describe("formatNombreCampo", () => {
  it("traduce los campos de las entidades de estado y de fichaje", () => {
    expect(formatNombreCampo("fechaHoraDesde")).toBe("Vigente desde");
    expect(formatNombreCampo("estadoAsistencia")).toBe("Estado de la asistencia");
    expect(formatNombreCampo("tipoAsistencia")).toBe("Tipo de registro");
    expect(formatNombreCampo("fechaHoraIngreso")).toBe("Hora de ingreso");
    expect(formatNombreCampo("motivoJornadaTrabajoEstado")).toBe("Motivo");
  });

  it("mantiene el fallback para campos desconocidos", () => {
    expect(formatNombreCampo("campoNuevoSinEtiqueta")).toBe("Campo Nuevo Sin Etiqueta");
  });
});

describe("formatValorAuditoria con enums", () => {
  it("muestra el valor legible si el campo y el valor están mapeados", () => {
    expect(formatValorAuditoria("REGISTRO_MANUAL", "tipoAsistencia")).toBe("Registro manual");
    expect(formatValorAuditoria("PENDIENTE_INGRESO", "estadoAsistencia")).toBe("Pendiente de ingreso");
    expect(formatValorAuditoria("EN_REVISION", "estadoSolicitudAusencia")).toBe("En revisión");
  });

  it("cae al valor crudo si el valor o el campo no están mapeados", () => {
    expect(formatValorAuditoria("VALOR_FUTURO", "estadoAsistencia")).toBe("VALOR_FUTURO");
    expect(formatValorAuditoria("REGISTRO_MANUAL", "otroCampo")).toBe("REGISTRO_MANUAL");
    expect(formatValorAuditoria("REGISTRO_MANUAL")).toBe("REGISTRO_MANUAL");
  });

  it("no confunde claves heredadas de Object con valores de enum", () => {
    expect(etiquetaValorEnum("toString", "x")).toBeUndefined();
    expect(etiquetaValorEnum("tipoAsistencia", "constructor")).toBeUndefined();
  });

  it("conserva el formateo existente de booleanos y vacíos", () => {
    expect(formatValorAuditoria("true", "enabled")).toBe("Sí");
    expect(formatValorAuditoria(null, "estadoAsistencia")).toBe("—");
  });
});
