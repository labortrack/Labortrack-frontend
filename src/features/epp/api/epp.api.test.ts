import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpClient } from "@/shared/lib/http/httpClient";
import {
  getMisRemitos,
  getRemitoPdf,
  getRemitosPaginados,
  registrarRemito,
} from "./epp.api";

vi.mock("@/shared/lib/http/httpClient", () => ({
  httpClient: { get: vi.fn(), post: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getRemitoPdf", () => {
  it("pide el PDF del remito como blob con el cliente autenticado y lo devuelve", async () => {
    const pdf = new Blob(["%PDF"], { type: "application/pdf" });
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: pdf });

    await expect(getRemitoPdf(123)).resolves.toBe(pdf);
    expect(httpClient.get).toHaveBeenCalledWith("/epp/remitos/123/pdf", {
      responseType: "blob",
    });
  });
});

describe("registrarRemito", () => {
  it("envía el remito con todos sus ítems en un solo POST", async () => {
    const payload = {
      empleadoId: 7,
      fechaEntrega: "2026-11-08",
      items: [
        { eppId: 1, cantidad: 2 },
        { eppId: 3, cantidad: 1 },
      ],
    };
    const remito = { id: 42 };
    vi.mocked(httpClient.post).mockResolvedValueOnce({ data: remito });

    await expect(registrarRemito(payload)).resolves.toBe(remito);
    expect(httpClient.post).toHaveBeenCalledWith("/epp/remitos", payload);
  });
});

describe("getRemitosPaginados", () => {
  it("pide la página de remitos con page y size", async () => {
    const pagina = { content: [] };
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: pagina });

    await expect(getRemitosPaginados(2, 10)).resolves.toBe(pagina);
    expect(httpClient.get).toHaveBeenCalledWith("/epp/remitos/paginadas", {
      params: { page: 2, size: 10 },
    });
  });
});

describe("getMisRemitos", () => {
  it("pide los remitos del usuario autenticado", async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: [] });

    await expect(getMisRemitos()).resolves.toEqual([]);
    expect(httpClient.get).toHaveBeenCalledWith("/epp/remitos/mios");
  });
});
