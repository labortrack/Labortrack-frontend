import { describe, expect, it } from "vitest";
import type { AuditoriaLogDTO, CambioCampoDTO, OperacionAuditoria } from "../types/auditoria.types";
import {
  cambiosVisibles,
  clasificarRevision,
  esCierreDeVigencia,
  etiquetaOperacion,
  tipoFichajeDelHistorial,
  tonoOperacion,
} from "./historialPresentacion";

function cambio(campo: string, valorNuevo: string | null, valorAnterior: string | null = null): CambioCampoDTO {
  return { campo, valorAnterior, valorNuevo };
}

function log(operacion: OperacionAuditoria, cambios: CambioCampoDTO[], revision = 1): AuditoriaLogDTO {
  return {
    revision,
    fecha: "2026-10-20T12:00:00Z",
    operacion,
    usuario: "admin@labortrack.com",
    rol: "ROLE_ADMIN",
    entidad: "x",
    entidadId: 1,
    cambios,
  };
}

describe("cambiosVisibles", () => {
  it("oculta id y fechaAlta en cualquier operación", () => {
    const visibles = cambiosVisibles(log("MODIFICACION", [
      cambio("id", "1"), cambio("fechaAlta", "2026-10-20T10:00"), cambio("nombre", "Nuevo", "Viejo"),
    ]));
    expect(visibles.map((c) => c.campo)).toEqual(["nombre"]);
  });

  it("oculta usuarioSubidaId y los flags de Spring Security solo en CREACION", () => {
    const campos = [
      cambio("usuarioSubidaId", "7"), cambio("accountNonExpired", "true"),
      cambio("accountNonLocked", "true"), cambio("credentialsNonExpired", "true"),
      cambio("enabled", "true"),
    ];
    expect(cambiosVisibles(log("CREACION", campos)).map((c) => c.campo)).toEqual(["enabled"]);
    expect(cambiosVisibles(log("MODIFICACION", campos))).toHaveLength(5);
  });
});

describe("clasificarRevision", () => {
  it("la MODIFICACION vacía más antigua es anterior al inicio de la auditoría", () => {
    expect(clasificarRevision(log("MODIFICACION", []), true)).toBe("PREVIA_A_AUDITORIA");
  });

  it("una MODIFICACION vacía posterior corresponde a cambios en relaciones", () => {
    expect(clasificarRevision(log("MODIFICACION", []), false)).toBe("RELACIONES_SIN_DETALLE");
  });

  it("ELIMINACION y CREACION nunca se tratan como vacías", () => {
    expect(clasificarRevision(log("ELIMINACION", []), true)).toBe("CON_DETALLE");
    expect(clasificarRevision(log("CREACION", []), true)).toBe("CON_DETALLE");
  });
});

describe("esCierreDeVigencia", () => {
  it("es cierre solo si únicamente cambió fechaHoraHasta o fechaHasta", () => {
    expect(esCierreDeVigencia([cambio("fechaHoraHasta", "2026-10-20T10:00")])).toBe(true);
    expect(esCierreDeVigencia([cambio("fechaHasta", "2026-10-20")])).toBe(true);
    expect(esCierreDeVigencia([cambio("fechaHasta", "2026-10-20"), cambio("motivo", "x")])).toBe(false);
    expect(esCierreDeVigencia([])).toBe(false);
  });
});

describe("tipoFichajeDelHistorial", () => {
  it("toma el tipo del alta aunque la anulación llegue sin cambios", () => {
    const historial = [
      log("ELIMINACION", [], 2),
      log("CREACION", [cambio("tipoAsistencia", "REGISTRO_MANUAL"), cambio("fechaHoraIngreso", "2026-10-20T08:00")], 1),
    ];
    expect(tipoFichajeDelHistorial(historial)).toBe("REGISTRO_MANUAL");
  });

  it("devuelve null si el tipo no está en el historial", () => {
    expect(tipoFichajeDelHistorial([log("MODIFICACION", [])])).toBeNull();
  });
});

describe("etiquetaOperacion", () => {
  it("Ingreso/Egreso: registro según el tipo y ELIMINACION como Anulación", () => {
    expect(etiquetaOperacion("ingreso", "CREACION", { tipoFichaje: "REGISTRO_MANUAL" })).toBe("Registro manual");
    expect(etiquetaOperacion("egreso", "CREACION", { tipoFichaje: "QR" })).toBe("Registro QR");
    expect(etiquetaOperacion("ingreso", "CREACION")).toBe("Registro");
    expect(etiquetaOperacion("egreso", "ELIMINACION")).toBe("Anulación");
  });

  it("tablas de estado: nuevo estado y cierre de vigencia", () => {
    expect(etiquetaOperacion("asistencia_estado", "CREACION")).toBe("Nuevo estado");
    expect(etiquetaOperacion("cuadrilla_estado", "MODIFICACION", {
      cambios: [cambio("fechaHasta", "2026-10-20")],
    })).toBe("Cierre de vigencia");
    expect(etiquetaOperacion("solicitud_ausencia_estado", "MODIFICACION", {
      cambios: [cambio("fechaHoraHasta", "2026-10-20T10:00"), cambio("motivo", "x")],
    })).toBe("Modificación");
    // Sin cambios conocidos (feed global) no se afirma un cierre
    expect(etiquetaOperacion("cuadrilla_estado", "MODIFICACION")).toBe("Modificación");
  });

  it("resto de las entidades", () => {
    expect(etiquetaOperacion("cuadrilla", "CREACION")).toBe("Alta");
    expect(etiquetaOperacion("cuadrilla", "MODIFICACION")).toBe("Modificación");
    expect(etiquetaOperacion("cuadrilla", "ELIMINACION")).toBe("Eliminación");
  });
});

describe("tonoOperacion", () => {
  it("destaca registros manuales y anulaciones, y deja el QR en segundo plano", () => {
    expect(tonoOperacion("ingreso", "CREACION", "REGISTRO_MANUAL")).toBe("warning");
    expect(tonoOperacion("egreso", "CREACION", "QR")).toBe("neutral");
    expect(tonoOperacion("ingreso", "ELIMINACION", "QR")).toBe("error");
  });

  it("mantiene los tonos habituales del resto", () => {
    expect(tonoOperacion("cuadrilla", "CREACION")).toBe("success");
    expect(tonoOperacion("cuadrilla", "MODIFICACION")).toBe("primary");
    expect(tonoOperacion("cuadrilla", "ELIMINACION")).toBe("error");
  });
});
