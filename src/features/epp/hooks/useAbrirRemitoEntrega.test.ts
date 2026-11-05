import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it, vi } from "vitest";
import { mensajeErrorRemito, puedeImprimirRemito } from "./useAbrirRemitoEntrega";

vi.mock("@/shared/lib/http/httpClient", () => ({
  httpClient: { get: vi.fn() },
}));

function errorHttp(status: number): AxiosError {
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, {
    status,
    data: new Blob(),
  } as AxiosResponse);
}

describe("puedeImprimirRemito", () => {
  it("ADMIN y RRHH pueden imprimir remitos", () => {
    expect(puedeImprimirRemito("ROLE_ADMIN")).toBe(true);
    expect(puedeImprimirRemito("ROLE_RRHH")).toBe(true);
  });

  it("operario, contador y sin sesión no ven el botón", () => {
    expect(puedeImprimirRemito("ROLE_OPERARIO")).toBe(false);
    expect(puedeImprimirRemito("ROLE_CONTADOR")).toBe(false);
    expect(puedeImprimirRemito(undefined)).toBe(false);
  });
});

describe("mensajeErrorRemito", () => {
  it("403 indica falta de permiso", () => {
    expect(mensajeErrorRemito(errorHttp(403))).toBe("No tenés permiso para imprimir remitos.");
  });

  it("404 indica que la entrega no existe", () => {
    expect(mensajeErrorRemito(errorHttp(404))).toBe("No se encontró la entrega.");
  });

  it("otros errores del servidor muestran el mensaje genérico", () => {
    expect(mensajeErrorRemito(errorHttp(500))).toBe(
      "No se pudo generar el remito. Intentá nuevamente.",
    );
  });

  it("sin respuesta del servidor muestra el error de conexión", () => {
    expect(mensajeErrorRemito(new AxiosError("Network Error", "ERR_NETWORK"))).toBe(
      "No se pudo conectar con el servidor. Verificá tu conexión e intentá nuevamente.",
    );
  });
});
