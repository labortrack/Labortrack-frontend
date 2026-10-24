import axios from "axios";
import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { documentacionApi } from "../api/documentacionApi";
import type { ChatMessage } from "../types/ragChat.types";
import {
  conversacionInicial,
  debeLimpiarConversacion,
  deserializarConversacion,
  estaVencida,
  normalizarAlHidratar,
  serializarConversacion,
  type ConversacionTracky,
} from "../utils/trackyConversacion";

const CLAVE_STORAGE = "labortrack-tracky-chat";

export type ResultadoEnvio =
  | { tipo: "ok" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "auth"; mensaje: string }
  /** No se envió: ya había una consulta en vuelo. */
  | { tipo: "ignorada" }
  /** La conversación se limpió mientras la consulta estaba en vuelo. */
  | { tipo: "descartada" };

interface TrackyChatState extends ConversacionTracky {
  /** Cambia en cada limpieza; una respuesta de otra conversación se descarta. */
  conversacionId: number;
  enviarPregunta: (pregunta: string) => Promise<ResultadoEnvio>;
  limpiar: () => void;
  verificarVencimiento: () => void;
}

// Storage propio: valida, vence y revive fechas con las funciones puras de utils.
const storageConversacion: PersistStorage<ConversacionTracky> = {
  getItem: (name) => {
    try {
      const conversacion = deserializarConversacion(
        sessionStorage.getItem(name),
        Date.now(),
      );
      if (!conversacion) {
        sessionStorage.removeItem(name);
        return null;
      }
      return { state: normalizarAlHidratar(conversacion), version: 1 };
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      sessionStorage.setItem(name, serializarConversacion(value.state));
    } catch {
      // Sin sessionStorage (modo privado, cuota llena) el chat sigue en memoria.
    }
  },
  removeItem: (name) => {
    try {
      sessionStorage.removeItem(name);
    } catch {
      // Ídem setItem.
    }
  },
};

export const useTrackyChatStore = create<TrackyChatState>()(
  persist(
    (set, get) => ({
      ...conversacionInicial(),
      conversacionId: 0,

      limpiar: () =>
        set((state) => ({
          ...conversacionInicial(),
          conversacionId: state.conversacionId + 1,
        })),

      verificarVencimiento: () => {
        if (estaVencida(get().ultimaActividad, Date.now())) get().limpiar();
      },

      enviarPregunta: async (pregunta) => {
        get().verificarVencimiento();
        if (get().enVuelo) return { tipo: "ignorada" };

        const conversacionId = get().conversacionId;
        const agregar = (mensaje: ChatMessage) =>
          set((state) => ({
            mensajes: [...state.mensajes, mensaje],
            ultimaActividad: Date.now(),
            enVuelo: false,
          }));

        set((state) => ({
          propietarioId:
            useSessionStore.getState().user?.idUsuario ?? state.propietarioId,
          mensajes: [
            ...state.mensajes,
            {
              id: `user-${Date.now()}`,
              sender: "user",
              content: pregunta,
              timestamp: new Date(),
            },
          ],
          ultimaActividad: Date.now(),
          enVuelo: true,
        }));

        try {
          const res = await documentacionApi.consultarChat({ pregunta });
          if (get().conversacionId !== conversacionId) return { tipo: "descartada" };
          agregar({
            id: `bot-${Date.now()}`,
            sender: "bot",
            content:
              res.respuesta ||
              "No se recibió una respuesta del motor de Inteligencia Artificial.",
            timestamp: new Date(),
            fuentes: res.fuentes,
          });
          return { tipo: "ok" };
        } catch (error) {
          if (get().conversacionId !== conversacionId) return { tipo: "descartada" };

          const apiErr = normalizeApiError(
            error,
            "No fue posible comunicarse con el asistente virtual Tracky.",
          );
          const isAuthError =
            apiErr.status === 401 ||
            apiErr.status === 403 ||
            (axios.isAxiosError(error) &&
              (error.response?.status === 401 || error.response?.status === 403));

          if (isAuthError) {
            const sessionExpiredMsg =
              "Tu sesión ha expirado por seguridad. Por favor, vuelve a iniciar sesión para continuar usando Tracky.";
            agregar({
              id: `err-${Date.now()}`,
              sender: "bot",
              content: sessionExpiredMsg,
              timestamp: new Date(),
              isError: true,
            });
            return { tipo: "auth", mensaje: sessionExpiredMsg };
          }

          agregar({
            id: `err-${Date.now()}`,
            sender: "bot",
            content: `Ocurrió un error al procesar tu consulta: ${apiErr.message}. Por favor verificá tu conexión o intentá nuevamente en unos instantes.`,
            timestamp: new Date(),
            isError: true,
          });
          return { tipo: "error", mensaje: apiErr.message };
        }
      },
    }),
    {
      name: CLAVE_STORAGE,
      version: 1,
      storage: storageConversacion,
      partialize: ({ propietarioId, ultimaActividad, mensajes, enVuelo }) => ({
        propietarioId,
        ultimaActividad,
        mensajes,
        enVuelo,
      }),
    },
  ),
);

/**
 * Limpia la conversación al cerrar sesión (logout o 401) y al cambiar el usuario
 * autenticado. Se registra desde SessionInitializer para que funcione aunque la
 * página del asistente nunca se haya cargado. Devuelve la función de desuscripción.
 */
export function vincularChatTrackyASesion() {
  const revisar = () => {
    const sesion = useSessionStore.getState();
    const chat = useTrackyChatStore.getState();
    if (debeLimpiarConversacion(chat.propietarioId, sesion)) {
      // Con el chat ya vacío no se limpia de nuevo, así no se corta un envío recién hecho.
      if (chat.ultimaActividad !== null || chat.enVuelo) chat.limpiar();
    }
  };
  revisar();
  return useSessionStore.subscribe(revisar);
}
