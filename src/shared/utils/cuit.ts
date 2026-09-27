// Formatea dígitos de CUIT/CUIL con la forma xx-xxxxxxxx-x.
export function formatCuit(digits: string): string {
  const clean = digits.replace(/\D/g, "").slice(0, 11);
  if (clean.length <= 2) return clean;
  if (clean.length <= 10) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
}
