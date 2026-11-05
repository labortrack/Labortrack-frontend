import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post, create, adminGet, adminPost } = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), create: vi.fn(), adminGet: vi.fn(), adminPost: vi.fn(),
}));
vi.mock("axios", () => ({ default: { create } }));
vi.mock("@/shared/lib/http/httpClient", () => ({ httpClient: { get: adminGet, post: adminPost } }));
vi.mock("@/app/config/env", () => ({ env: { apiBaseUrl: "https://api.labortrack.test" } }));

describe("identidad independiente de terminal", () => {
  beforeEach(() => {
    vi.resetModules(); vi.clearAllMocks();
    create.mockReturnValue({ get, post });
    get.mockResolvedValue({ data: { obraId: 12 } });
    post.mockResolvedValue({ data: { id: 8 } });
  });
  it("usa cookie propia y no el cliente de sesión del usuario", async () => {
    const { terminalPublicApi } = await import("./terminalApi");
    await terminalPublicApi.qr();
    expect(create).toHaveBeenCalledWith({ baseURL: "https://api.labortrack.test", withCredentials: true,
      headers: { "Content-Type": "application/json", "X-Requested-With": "LaborTrack" } });
    expect(get).toHaveBeenCalledWith("/api/terminales/actual/qr");
    expect(adminGet).not.toHaveBeenCalled();
  });
  it("al vincular sólo envía el código, nunca un id de obra elegible", async () => {
    const { terminalPublicApi } = await import("./terminalApi");
    await terminalPublicApi.vincular("12345678");
    expect(post).toHaveBeenCalledWith("/api/terminales/vincular", { codigo: "12345678" });
    expect(adminPost).not.toHaveBeenCalled();
  });
});
