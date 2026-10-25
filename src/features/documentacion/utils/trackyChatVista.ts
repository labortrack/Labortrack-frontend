import type { ChatMessage } from "../types/ragChat.types";
import { estadoAvatarTracky, type EstadoAvatarTracky } from "./trackyAvatar";

/** Id del mensaje de bienvenida que el store guarda al iniciar la conversación. */
export const ID_BIENVENIDA = "welcome-msg";

/** La conversación está vacía mientras solo tiene la bienvenida. */
export function esConversacionVacia(mensajes: ChatMessage[]): boolean {
  return mensajes.every((m) => m.id === ID_BIENVENIDA);
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
