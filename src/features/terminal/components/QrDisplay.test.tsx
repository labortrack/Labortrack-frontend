import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { QrDisplay } from "./QrDisplay";

describe("pantalla de QR", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-27T12:00:00Z"));
    vi.stubGlobal("window", { location: { origin: "https://labortrack.test" } });
    vi.stubGlobal("navigator", { onLine: true });
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  const qr = { obraId: 12, nombreObra: "Obra Norte", tokenQr: "token-firmado", venceEn: "2026-10-27T12:01:30Z" };
  it("muestra un QR vigente aunque haya fallado una renovación", () => {
    const html = renderToStaticMarkup(<QrDisplay qr={qr} error="Sin conexión" onRetry={() => {}} />);
    expect(html).toContain("QR de asistencia de la obra");
    expect(html).toContain("Código válido por 90 segundos");
    expect(html).toContain("Sin conexión");
  });
  it("oculta el QR exactamente cuando vence", () => {
    vi.setSystemTime(new Date(qr.venceEn));
    const html = renderToStaticMarkup(<QrDisplay qr={qr} error="Sin conexión" onRetry={() => {}} />);
    expect(html).not.toContain("QR de asistencia de la obra");
    expect(html).toContain("No hay un QR vigente");
  });
  it("explica la falta de conexión y nunca muestra un QR vencido", () => {
    vi.stubGlobal("navigator", { onLine: false });
    vi.setSystemTime(new Date("2026-10-27T13:00:00Z"));
    const html = renderToStaticMarkup(<QrDisplay qr={qr} onRetry={() => {}} />);
    expect(html).not.toContain("QR de asistencia de la obra");
    expect(html).toContain("Sin conexión");
  });
});
