import { z } from "zod";
import type { TipoAusenciaDisponible } from "../types/solicitudAusencia.types";
import { cantidadDiasAusencia, esFechaValida, fechaLocalHoy } from "../utils/solicitudAusenciaFormatters";

export function solicitudAusenciaSchema(tipos: TipoAusenciaDisponible[]) {
  return z.object({
    tipoId: z.string().min(1, "Seleccioná un tipo de solicitud."),
    fechaDesde: z.string().refine(esFechaValida, "Ingresá una fecha válida."),
    fechaHasta: z.string().refine(esFechaValida, "Ingresá una fecha válida."),
    motivo: z.string().trim().min(1, "Ingresá el motivo de la ausencia."),
  }).superRefine((datos, ctx) => {
    const tipo = tipos.find((item) => String(item.id) === datos.tipoId);
    if (!tipo) ctx.addIssue({ code: "custom", path: ["tipoId"], message: "Seleccioná un tipo activo disponible." });
    if (!esFechaValida(datos.fechaDesde) || !esFechaValida(datos.fechaHasta)) return;
    if (datos.fechaHasta < datos.fechaDesde) ctx.addIssue({ code: "custom", path: ["fechaHasta"], message: "La fecha hasta no puede ser anterior a la fecha desde." });
    else if (tipo && cantidadDiasAusencia(datos.fechaDesde, datos.fechaHasta) > tipo.maxDias)
      ctx.addIssue({ code: "custom", path: ["fechaHasta"], message: `Este tipo permite hasta ${tipo.maxDias} días.` });
    if (tipo && !tipo.permiteRetroactiva && datos.fechaDesde < fechaLocalHoy())
      ctx.addIssue({ code: "custom", path: ["fechaDesde"], message: "Este tipo no permite solicitudes retroactivas." });
  });
}
export type SolicitudAusenciaForm = z.infer<ReturnType<typeof solicitudAusenciaSchema>>;
const FORMATOS = new Set(["application/pdf", "image/jpeg", "image/png"]);
export function validarAdjuntos(documentos: File[]): string | undefined {
  if (documentos.some((file) => !FORMATOS.has(file.type) || !/\.(pdf|jpe?g|png)$/i.test(file.name)))
    return "Solo se permiten archivos PDF, JPG o PNG.";
  if (documentos.some((file) => file.size === 0)) return "No se permiten archivos vacíos.";
  if (documentos.some((file) => file.size > 10 * 1024 * 1024)) return "Cada archivo debe pesar como máximo 10 MB.";
  if (documentos.reduce((total, file) => total + file.size, 0) > 19 * 1024 * 1024)
    return "Los adjuntos deben sumar como máximo 19 MB.";
}

