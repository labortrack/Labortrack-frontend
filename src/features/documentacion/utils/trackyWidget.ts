import type { ChatMessage } from "../types/ragChat.types";

const RUTA_ASISTENTE = "/asistente-virtual";

/** El widget no se muestra en la propia pantalla del asistente ni en sus subrutas. */
export function debeMostrarWidgetTracky(ruta: string): boolean {
  const pathname = ruta.split(/[?#]/)[0].replace(/\/+$/, "");
  return pathname !== RUTA_ASISTENTE && !pathname.startsWith(`${RUTA_ASISTENTE}/`);
}

export type IndicadorTracky = "inactivo" | "pensando" | "nueva";

/**
 * Indicador del botón flotante con el panel cerrado: "pensando" mientras hay una
 * consulta en vuelo y "nueva" si llegó una respuesta desde la última vez que se vio.
 */
export function indicadorWidgetTracky({
  abierto,
  enVuelo,
  ultimoMensaje,
  ultimoIdVisto,
}: {
  abierto: boolean;
  enVuelo: boolean;
  ultimoMensaje: ChatMessage | undefined;
  ultimoIdVisto: string | undefined;
}): IndicadorTracky {
  if (abierto) return "inactivo";
  if (enVuelo) return "pensando";
  if (
    ultimoMensaje?.sender === "bot" &&
    ultimoMensaje.id !== "welcome-msg" &&
    ultimoMensaje.id !== ultimoIdVisto
  ) {
    return "nueva";
  }
  return "inactivo";
}
