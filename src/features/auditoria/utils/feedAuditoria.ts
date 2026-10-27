import type { AuditoriaFeedItem } from "../types/auditoria.types";

/** Clave única de una fila del feed: Envers deja una sola fila por entidad e id en cada revisión. */
export function claveFilaFeed(item: AuditoriaFeedItem): string {
  return `${item.revision}-${item.entidad}-${item.entidadId}`;
}

/**
 * Aplana las páginas del feed en orden y descarta filas repetidas. El cursor del backend ya
 * evita repetidos; esto protege las keys de React si una página llegara solapada.
 */
export function aplanarSinRepetidos(
  pages: readonly { items: readonly AuditoriaFeedItem[] }[],
): AuditoriaFeedItem[] {
  const vistas = new Set<string>();
  const items: AuditoriaFeedItem[] = [];
  for (const page of pages) {
    for (const item of page.items) {
      const clave = claveFilaFeed(item);
      if (vistas.has(clave)) continue;
      vistas.add(clave);
      items.push(item);
    }
  }
  return items;
}
