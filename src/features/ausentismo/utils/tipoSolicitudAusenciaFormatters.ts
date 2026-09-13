const fechaHoraFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatFechaHoraTipoAusencia(valor: string) {
  return fechaHoraFormatter.format(new Date(valor));
}
