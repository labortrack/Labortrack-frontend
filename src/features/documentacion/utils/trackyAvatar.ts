/**
 * Estados del avatar de Tracky.
 *
 * DTE del avatar (estado de interfaz, no es una entidad del modelo):
 *
 *   Chat (ChatRag: vista vacía y burbuja en curso):
 *     inactivo    → atento       se abre el panel o se entra a /asistente-virtual
 *     atento      → pensando     se envía una consulta
 *     pensando    → escribiendo  llega la respuesta y empieza el tipeo
 *     escribiendo → atento       termina el tipeo
 *     pensando    → atento       la respuesta es un error (sin tipeo) o se reinicia
 *                                la conversación con la consulta en vuelo
 *     escribiendo → pensando     se envía otra consulta durante el tipeo
 *     atento      → inactivo     se cierra el panel o se sale de la pantalla
 *
 *   Botón flotante (usa inactivo, atento y pensando):
 *     inactivo    → atento       el cursor entra al botón con el panel cerrado
 *     atento      → inactivo     el cursor sale o se abre el panel
 *     inactivo    → pensando     hay una consulta en vuelo
 *     atento      → pensando     hay una consulta en vuelo con el cursor encima
 *     pensando    → inactivo     llega la respuesta o se limpia la conversación
 *     pensando    → atento       llega la respuesta con el cursor encima y el panel cerrado
 *   El foco con teclado no cambia el estado: solo agranda el botón y muestra el outline.
 *
 * Prioridad al calcularlo: pensando > escribiendo > atento > inactivo.
 */
export type EstadoAvatarTracky =
  | "inactivo"
  | "atento"
  | "pensando"
  | "escribiendo";

/**
 * - visible: el chat está a la vista (ChatRag montado).
 * - enVuelo: hay una consulta sin respuesta.
 * - escribiendo: el efecto de tipeo de la última respuesta está en curso.
 */
export function estadoAvatarTracky({
  visible,
  enVuelo,
  escribiendo,
}: {
  visible: boolean;
  enVuelo: boolean;
  escribiendo: boolean;
}): EstadoAvatarTracky {
  if (enVuelo) return "pensando";
  if (visible && escribiendo) return "escribiendo";
  if (visible) return "atento";
  return "inactivo";
}

/**
 * Estado del botón flotante. hover es el cursor sobre el botón con el panel cerrado;
 * ni el toque ni el foco con teclado cuentan.
 */
export function estadoAvatarBoton({
  enVuelo,
  hover,
}: {
  enVuelo: boolean;
  hover: boolean;
}): EstadoAvatarTracky {
  return estadoAvatarTracky({ visible: hover, enVuelo, escribiendo: false });
}
