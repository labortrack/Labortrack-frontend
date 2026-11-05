/** Fecha calendario local (YYYY-MM-DD), no la de UTC que da toISOString. */
export function fechaLocalActual(fecha = new Date()) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fechaLocal(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function sumarDiasFechaLocal(value: string, cantidad: number) {
  const fecha = fechaLocal(value);
  fecha.setDate(fecha.getDate() + cantidad);
  return fechaLocalActual(fecha);
}
