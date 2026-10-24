import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../types/ragChat.types";
import { debeMostrarWidgetTracky, indicadorWidgetTracky } from "./trackyWidget";

describe("debeMostrarWidgetTracky", () => {
  it("se muestra en las demás pantallas", () => {
    expect(debeMostrarWidgetTracky("/dashboard")).toBe(true);
    expect(debeMostrarWidgetTracky("/documentacion")).toBe(true);
  });

  it("se oculta en la pantalla del asistente", () => {
    expect(debeMostrarWidgetTracky("/asistente-virtual")).toBe(false);
  });

  it("se oculta con barra final", () => {
    expect(debeMostrarWidgetTracky("/asistente-virtual/")).toBe(false);
  });

  it("se oculta en subrutas", () => {
    expect(debeMostrarWidgetTracky("/asistente-virtual/historial")).toBe(false);
  });

  it("se oculta con query o hash", () => {
    expect(debeMostrarWidgetTracky("/asistente-virtual?pregunta=vacaciones")).toBe(false);
    expect(debeMostrarWidgetTracky("/asistente-virtual/?x=1#fin")).toBe(false);
  });

  it("no confunde una ruta que solo comparte el prefijo", () => {
    expect(debeMostrarWidgetTracky("/asistente-virtual-2")).toBe(true);
  });

  it("una query que menciona la ruta no lo oculta", () => {
    expect(debeMostrarWidgetTracky("/dashboard?volver=/asistente-virtual")).toBe(true);
  });
});

describe("indicadorWidgetTracky", () => {
  const bot = (id: string): ChatMessage => ({ id, sender: "bot", content: "Respuesta" });
  const user = (id: string): ChatMessage => ({ id, sender: "user", content: "Pregunta" });

  it("con el panel abierto no muestra indicador", () => {
    expect(
      indicadorWidgetTracky({
        abierto: true,
        enVuelo: true,
        ultimoMensaje: bot("bot-2"),
        ultimoIdVisto: "user-1",
      }),
    ).toBe("inactivo");
  });

  it("con una consulta en vuelo muestra pensando", () => {
    expect(
      indicadorWidgetTracky({
        abierto: false,
        enVuelo: true,
        ultimoMensaje: user("user-1"),
        ultimoIdVisto: "user-1",
      }),
    ).toBe("pensando");
  });

  it("una respuesta no vista muestra nueva", () => {
    expect(
      indicadorWidgetTracky({
        abierto: false,
        enVuelo: false,
        ultimoMensaje: bot("bot-2"),
        ultimoIdVisto: "user-1",
      }),
    ).toBe("nueva");
  });

  it("una respuesta ya vista no muestra indicador", () => {
    expect(
      indicadorWidgetTracky({
        abierto: false,
        enVuelo: false,
        ultimoMensaje: bot("bot-2"),
        ultimoIdVisto: "bot-2",
      }),
    ).toBe("inactivo");
  });

  it("el mensaje de bienvenida no cuenta como respuesta nueva", () => {
    expect(
      indicadorWidgetTracky({
        abierto: false,
        enVuelo: false,
        ultimoMensaje: bot("welcome-msg"),
        ultimoIdVisto: undefined,
      }),
    ).toBe("inactivo");
  });
});
