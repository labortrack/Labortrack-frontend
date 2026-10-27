import type { SessionStatus } from "@/features/auth/types/auth.types";
import type { ChatMessage } from "../types/ragChat.types";

/** La conversación se descarta tras 30 minutos sin mensajes nuevos. */
export const TTL_CONVERSACION_MS = 30 * 60 * 1000;

const VERSION_SERIALIZACION = 1;

export const AVISO_RESPUESTA_INTERRUMPIDA =
  "La respuesta se interrumpió al recargar la página. Volvé a enviar tu consulta.";

export interface ConversacionTracky {
  /** idUsuario dueño de la conversación; null mientras no envió ninguna pregunta. */
  propietarioId: number | null;
  /** Epoch ms del último mensaje; null si solo está la bienvenida. */
  ultimaActividad: number | null;
  mensajes: ChatMessage[];
  /** Hay una consulta enviada sin respuesta todavía. */
  enVuelo: boolean;
}

export function mensajeBienvenida(ahora: Date = new Date()): ChatMessage {
  return {
    id: "welcome-msg",
    sender: "bot",
    content:
      "¡Hola! Soy Tracky. Te ayudo con normativas, protocolos y documentación institucional de LaborTrack.",
    timestamp: ahora,
  };
}

export function conversacionInicial(ahora: Date = new Date()): ConversacionTracky {
  return {
    propietarioId: null,
    ultimaActividad: null,
    mensajes: [mensajeBienvenida(ahora)],
    enVuelo: false,
  };
}

export function estaVencida(
  ultimaActividad: number | null,
  ahora: number,
  ttlMs: number = TTL_CONVERSACION_MS,
): boolean {
  return ultimaActividad !== null && ahora - ultimaActividad >= ttlMs;
}

export function serializarConversacion(conversacion: ConversacionTracky): string {
  return JSON.stringify({
    version: VERSION_SERIALIZACION,
    propietarioId: conversacion.propietarioId,
    ultimaActividad: conversacion.ultimaActividad,
    enVuelo: conversacion.enVuelo,
    mensajes: conversacion.mensajes.map((m) => ({
      ...m,
      timestamp:
        m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    })),
  });
}

function esNumeroONull(valor: unknown): valor is number | null {
  return valor === null || typeof valor === "number";
}

function revivirMensaje(valor: unknown): ChatMessage | null {
  if (typeof valor !== "object" || valor === null) return null;
  const m = valor as Record<string, unknown>;
  if (
    typeof m.id !== "string" ||
    (m.sender !== "user" && m.sender !== "bot") ||
    typeof m.content !== "string"
  ) {
    return null;
  }
  const mensaje = { ...m } as unknown as ChatMessage;
  if (typeof m.timestamp === "string") {
    const fecha = new Date(m.timestamp);
    // ChatBubble muestra el string tal cual si no es Date: sin revivirlo se vería el ISO.
    mensaje.timestamp = Number.isNaN(fecha.getTime()) ? undefined : fecha;
  }
  return mensaje;
}

/**
 * Lee lo guardado en sessionStorage. Devuelve null si no hay nada, si está corrupto,
 * si es de otra versión o si la conversación ya venció.
 */
export function deserializarConversacion(
  raw: string | null,
  ahora: number,
  ttlMs: number = TTL_CONVERSACION_MS,
): ConversacionTracky | null {
  if (!raw) return null;
  let datos: unknown;
  try {
    datos = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof datos !== "object" || datos === null) return null;
  const d = datos as Record<string, unknown>;
  if (
    d.version !== VERSION_SERIALIZACION ||
    !esNumeroONull(d.propietarioId) ||
    !esNumeroONull(d.ultimaActividad) ||
    typeof d.enVuelo !== "boolean" ||
    !Array.isArray(d.mensajes)
  ) {
    return null;
  }
  const mensajes = d.mensajes.map(revivirMensaje);
  if (mensajes.length === 0 || mensajes.some((m) => m === null)) return null;
  if (estaVencida(d.ultimaActividad, ahora, ttlMs)) return null;
  return {
    propietarioId: d.propietarioId,
    ultimaActividad: d.ultimaActividad,
    enVuelo: d.enVuelo,
    mensajes: mensajes as ChatMessage[],
  };
}

/**
 * Una recarga corta la request en vuelo y su respuesta ya no llega: se avisa en el chat
 * en vez de reenviar la pregunta.
 */
export function normalizarAlHidratar(
  conversacion: ConversacionTracky,
  ahora: Date = new Date(),
): ConversacionTracky {
  if (!conversacion.enVuelo) return conversacion;
  return {
    ...conversacion,
    enVuelo: false,
    mensajes: [
      ...conversacion.mensajes,
      {
        id: `err-recarga-${ahora.getTime()}`,
        sender: "bot",
        content: AVISO_RESPUESTA_INTERRUMPIDA,
        timestamp: ahora,
        isError: true,
      },
    ],
  };
}

/**
 * Decide si la sesión actual invalida la conversación guardada. En "checking" no se
 * limpia: al recargar la sesión arranca así, con user null, y se perdería el chat.
 */
export function debeLimpiarConversacion(
  propietarioId: number | null,
  sesion: { status: SessionStatus; user: { idUsuario: number } | null },
): boolean {
  if (sesion.status === "anonymous") return true;
  if (sesion.status === "authenticated" && sesion.user && propietarioId !== null) {
    return sesion.user.idUsuario !== propietarioId;
  }
  return false;
}
