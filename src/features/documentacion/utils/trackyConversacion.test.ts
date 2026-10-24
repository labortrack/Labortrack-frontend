import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../types/ragChat.types";
import {
  AVISO_RESPUESTA_INTERRUMPIDA,
  TTL_CONVERSACION_MS,
  debeLimpiarConversacion,
  deserializarConversacion,
  estaVencida,
  mensajeBienvenida,
  normalizarAlHidratar,
  serializarConversacion,
  type ConversacionTracky,
} from "./trackyConversacion";

const AHORA = Date.parse("2026-10-24T15:00:00Z");
const MINUTO = 60 * 1000;

function conversacion(parcial: Partial<ConversacionTracky> = {}): ConversacionTracky {
  const mensajes: ChatMessage[] = [
    mensajeBienvenida(new Date("2026-10-24T14:50:00Z")),
    {
      id: "user-1",
      sender: "user",
      content: "¿Cuántos días de vacaciones corresponden?",
      timestamp: new Date("2026-10-24T14:51:00Z"),
    },
    {
      id: "bot-1",
      sender: "bot",
      content: "Según el convenio, **14 días**.",
      timestamp: new Date("2026-10-24T14:52:00Z"),
      fuentes: [{ id: 3, titulo: "CCT 76/75", seccion: "Art. 12", pagina: 4 }],
    },
  ];
  return {
    propietarioId: 7,
    ultimaActividad: AHORA - 8 * MINUTO,
    mensajes,
    enVuelo: false,
    ...parcial,
  };
}

describe("estaVencida", () => {
  it("no vence antes de los 30 minutos", () => {
    expect(estaVencida(AHORA - (30 * MINUTO - 1000), AHORA)).toBe(false);
  });

  it("vence justo a los 30 minutos", () => {
    expect(estaVencida(AHORA - TTL_CONVERSACION_MS, AHORA)).toBe(true);
  });

  it("no vence si la última actividad está en el futuro (reloj corrido)", () => {
    expect(estaVencida(AHORA + 5 * MINUTO, AHORA)).toBe(false);
  });

  it("no vence una conversación sin actividad", () => {
    expect(estaVencida(null, AHORA)).toBe(false);
  });
});

describe("serializarConversacion / deserializarConversacion", () => {
  it("la ida y vuelta conserva fechas, fuentes y errores", () => {
    const original = conversacion({
      mensajes: [
        ...conversacion().mensajes,
        {
          id: "err-1",
          sender: "bot",
          content: "Falló",
          timestamp: new Date("2026-10-24T14:53:00Z"),
          isError: true,
        },
      ],
    });

    const leida = deserializarConversacion(serializarConversacion(original), AHORA);

    expect(leida).toEqual(original);
    expect(leida?.mensajes[1].timestamp).toBeInstanceOf(Date);
  });

  it("guarda las fechas como ISO string", () => {
    const json = JSON.parse(serializarConversacion(conversacion()));
    expect(json.mensajes[1].timestamp).toBe("2026-10-24T14:51:00.000Z");
  });

  it("devuelve null si no hay nada guardado", () => {
    expect(deserializarConversacion(null, AHORA)).toBeNull();
  });

  it("devuelve null con JSON inválido", () => {
    expect(deserializarConversacion("{no es json", AHORA)).toBeNull();
  });

  it("devuelve null con otra versión", () => {
    const json = JSON.parse(serializarConversacion(conversacion()));
    json.version = 99;
    expect(deserializarConversacion(JSON.stringify(json), AHORA)).toBeNull();
  });

  it("devuelve null si un mensaje no tiene la forma esperada", () => {
    const json = JSON.parse(serializarConversacion(conversacion()));
    json.mensajes[1].sender = "sistema";
    expect(deserializarConversacion(JSON.stringify(json), AHORA)).toBeNull();
  });

  it("devuelve null si la conversación venció", () => {
    const vencida = conversacion({ ultimaActividad: AHORA - 31 * MINUTO });
    expect(deserializarConversacion(serializarConversacion(vencida), AHORA)).toBeNull();
  });
});

describe("normalizarAlHidratar", () => {
  it("sin consulta en vuelo no cambia nada", () => {
    const c = conversacion();
    expect(normalizarAlHidratar(c)).toBe(c);
  });

  it("con consulta en vuelo agrega el aviso y apaga el flag", () => {
    const c = conversacion({ enVuelo: true });
    const ahora = new Date(AHORA);

    const normalizada = normalizarAlHidratar(c, ahora);

    expect(normalizada.enVuelo).toBe(false);
    expect(normalizada.mensajes).toHaveLength(c.mensajes.length + 1);
    expect(normalizada.mensajes.at(-1)).toEqual({
      id: `err-recarga-${AHORA}`,
      sender: "bot",
      content: AVISO_RESPUESTA_INTERRUMPIDA,
      timestamp: ahora,
      isError: true,
    });
  });
});

describe("debeLimpiarConversacion", () => {
  const usuario = (idUsuario: number) => ({ idUsuario });

  it("limpia al quedar la sesión anónima", () => {
    expect(debeLimpiarConversacion(7, { status: "anonymous", user: null })).toBe(true);
  });

  it("no limpia mientras la sesión se verifica", () => {
    expect(debeLimpiarConversacion(7, { status: "checking", user: null })).toBe(false);
  });

  it("no limpia con el mismo usuario", () => {
    expect(
      debeLimpiarConversacion(7, { status: "authenticated", user: usuario(7) }),
    ).toBe(false);
  });

  it("limpia si cambió el usuario autenticado", () => {
    expect(
      debeLimpiarConversacion(7, { status: "authenticated", user: usuario(8) }),
    ).toBe(true);
  });

  it("no limpia una conversación sin propietario", () => {
    expect(
      debeLimpiarConversacion(null, { status: "authenticated", user: usuario(8) }),
    ).toBe(false);
  });
});
