/**
 * Estados del avatar de Tracky.
 *
 * DTE del avatar (estado de interfaz, no es una entidad del modelo):
 *
 *   Encabezado del chat (ChatRag):
 *     inactivo    → atento       se abre el panel o se entra a /asistente-virtual
 *     atento      → pensando     se envía una consulta
 *     pensando    → escribiendo  llega la respuesta y empieza el tipeo
 *     escribiendo → atento       termina el tipeo
 *     pensando    → atento       la respuesta es un error (sin tipeo) o se reinicia
 *                                la conversación con la consulta en vuelo
 *     escribiendo → pensando     se envía otra consulta durante el tipeo
 *     atento      → inactivo     se cierra el panel o se sale de la pantalla
 *
 *   Botón flotante (solo usa inactivo y pensando):
 *     inactivo    → pensando     hay una consulta en vuelo
 *     pensando    → inactivo     llega la respuesta o se limpia la conversación
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

/** El botón flotante solo distingue inactivo y pensando. */
export function estadoAvatarBoton(enVuelo: boolean): EstadoAvatarTracky {
  return estadoAvatarTracky({ visible: false, enVuelo, escribiendo: false });
}
