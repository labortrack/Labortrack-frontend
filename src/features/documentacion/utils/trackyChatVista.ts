import type { ChatMessage } from "../types/ragChat.types";
import { estadoAvatarTracky, type EstadoAvatarTracky } from "./trackyAvatar";

/** Id del mensaje de bienvenida que el store guarda al iniciar la conversación. */
export const ID_BIENVENIDA = "welcome-msg";

/** La conversación está vacía mientras solo tiene la bienvenida. */
export function esConversacionVacia(mensajes: ChatMessage[]): boolean {
  return mensajes.every((m) => m.id === ID_BIENVENIDA);
}

/** Distancia al final, en px, dentro de la cual se considera que el usuario está al final. */
export const UMBRAL_FINAL_PX = 48;

/**
 * Si la conversación está scrolleada al final (o casi). Mientras sea así, el chat sigue
 * el final cuando crece el contenido, por ejemplo durante el tipeo; si el usuario sube
 * más allá del umbral para leer, deja de seguirlo. Sin scroll cuenta como al final.
 */
export function estaAlFinal({
  scrollTop,
  clientHeight,
  scrollHeight,
  umbral = UMBRAL_FINAL_PX,
}: {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
  umbral?: number;
}): boolean {
  return scrollHeight - scrollTop - clientHeight <= umbral;
}

export interface AvatarDeBurbuja {
  tamano: "chico" | "grande";
  estado: EstadoAvatarTracky;
  animado: boolean;
}

/**
 * Avatar de una burbuja del bot. Solo la respuesta en curso lo muestra grande y
 * animado; si mientras tanto sale otra consulta, cede el protagonismo a la burbuja
 * de "pensando" y queda en reposo, como las ya respondidas.
 */
export function avatarDeBurbuja({
  enCurso,
  enVuelo,
}: {
  enCurso: boolean;
  enVuelo: boolean;
}): AvatarDeBurbuja {
  if (enCurso && !enVuelo) {
    return {
      tamano: "grande",
      estado: estadoAvatarTracky({ visible: true, enVuelo, escribiendo: true }),
      animado: true,
    };
  }
  return { tamano: "chico", estado: "inactivo", animado: false };
}
