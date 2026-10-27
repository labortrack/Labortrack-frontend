const enteroFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const centavosFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Sin decimales si el monto es entero ("$ 209.650"); si no, siempre dos ("$ 183.446,80"). */
export function formatCurrency(value: number): string {
  return Number.isInteger(value)
    ? enteroFormatter.format(value)
    : centavosFormatter.format(value);
}
