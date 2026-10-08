export function fechaLocal(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function inicioSemana(fecha: string) {
  const date = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(date.getTime())) return inicioSemana(fechaLocal());
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return fechaLocal(date);
}

export function sumarDias(fecha: string, dias: number) {
  const date = new Date(`${fecha}T12:00:00`);
  date.setDate(date.getDate() + dias);
  return fechaLocal(date);
}

export function rutaDetalleJornada(id: number, origen: string) {
  const params = new URLSearchParams({ volver: origen });
  return `/jornadas/${id}?${params.toString()}`;
}

export function rutaRetornoJornada(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/jornadas";
  const path = value.split("?")[0];
  if (path === "/jornadas" || path === "/mi-cuadrilla" || /^\/obras\/\d+\/cuadrillas\/\d+$/.test(path) || /^\/cuadrillas\/\d+\/planes-trabajo\/\d+$/.test(path)) {
    return value;
  }
  return "/jornadas";
}
