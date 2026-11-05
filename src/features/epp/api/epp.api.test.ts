import { describe, expect, it, vi } from "vitest";
import { httpClient } from "@/shared/lib/http/httpClient";
import { getRemitoEntrega } from "./epp.api";

vi.mock("@/shared/lib/http/httpClient", () => ({
  httpClient: { get: vi.fn() },
}));

describe("getRemitoEntrega", () => {
  it("pide el remito de la entrega como blob con el cliente autenticado y lo devuelve", async () => {
    const pdf = new Blob(["%PDF"], { type: "application/pdf" });
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: pdf });

    await expect(getRemitoEntrega(123)).resolves.toBe(pdf);
    expect(httpClient.get).toHaveBeenCalledWith("/epp/entregas/123/remito", {
      responseType: "blob",
    });
  });
});
