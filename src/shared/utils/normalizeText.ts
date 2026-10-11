/**
 * Normaliza un texto removiendo diacríticos/tildes y convirtiéndolo a minúsculas,
 * para realizar búsquedas insensibles a mayúsculas y acentos.
 */
export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
