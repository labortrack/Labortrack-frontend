/**
 * Diccionario de mapeo de nombres técnicos de campos a etiquetas legibles por humanos.
 */
export const DICCIONARIO_CAMPOS: Record<string, string> = {
  // EPP
  stockEPP: "Stock",
  nombreEPP: "Nombre del EPP",
  cantidadEntregada: "Cantidad Entregada",
  fechaEntrega: "Fecha de Entrega",
  idEpp: "ID de EPP",
  idEmpleado: "ID de Empleado",

  // Fechas y vigencias
  fechaVigenciaDesde: "Fecha de Vigencia",
  fechaVigenciaHasta: "Fecha Fin de Vigencia",
  fechaInicio: "Fecha de Inicio",
  fechaFin: "Fecha de Fin",
  fechaAlta: "Fecha de Alta",
  fechaBaja: "Fecha de Baja",
  fechaNacimiento: "Fecha de Nacimiento",
  fechaIngreso: "Fecha de Ingreso",
  fechaEgreso: "Fecha de Egreso",
  fechaCreacion: "Fecha de Creación",
  fechaActualizacion: "Fecha de Actualización",
  fechaEmision: "Fecha de Emisión",

  // Datos de personas / legajos
  nombre: "Nombre",
  apellido: "Apellido",
  nombreEmpleado: "Nombre del Empleado",
  apellidoEmpleado: "Apellido del Empleado",
  dni: "DNI",
  cuil: "CUIL",
  cuit: "CUIT",
  email: "Correo Electrónico",
  telefono: "Teléfono",
  direccion: "Dirección",
  calle: "Calle",
  numero: "Número",
  piso: "Piso",
  departamento: "Departamento",
  codigoPostal: "Código Postal",
  localidad: "Localidad",
  provincia: "Provincia",
  pais: "País",
  nacionalidad: "Nacionalidad",
  estadoCivil: "Estado Civil",
  genero: "Género",

  // Datos laborales / ERP
  rol: "Rol",
  cargo: "Cargo",
  puesto: "Puesto",
  categoria: "Categoría",
  sector: "Sector",
  sueldo: "Sueldo",
  sueldoBasico: "Sueldo Básico",
  valorHora: "Valor Hora",
  salario: "Salario",
  horasTrabajadas: "Horas Trabajadas",
  horasExtras: "Horas Extras",

  // Obra / Empresa / Cuadrilla
  razonSocial: "Razón Social",
  nombreFantasia: "Nombre de Fantasía",
  obra: "Obra",
  idObra: "ID de Obra",
  nombreObra: "Nombre de la Obra",
  cuadrilla: "Cuadrilla",
  idCuadrilla: "ID de Cuadrilla",
  empresa: "Empresa",
  idEmpresa: "ID de Empresa",
  cliente: "Cliente",

  // Generales / Estados
  id: "ID",
  activo: "Estado Activo",
  estado: "Estado",
  habilitado: "Habilitado",
  descripcion: "Descripción",
  observaciones: "Observaciones",
  comentarios: "Comentarios",
  motivo: "Motivo",
  tipo: "Tipo",
  tipoDocumento: "Tipo de Documento",
  prioridad: "Prioridad",
  monto: "Monto",
  precio: "Precio",
  costo: "Costo",
  total: "Total",
  cantidad: "Cantidad",
  archivo: "Archivo",
  url: "Enlace URL",
};

/**
 * Convierte un nombre técnico de campo en una etiqueta legible para el usuario.
 * Si el campo no existe en el diccionario, aplica un fallback dividiendo camelCase/snake_case
 * y capitalizando cada palabra respetando siglas comunes.
 *
 * @param campo - Nombre técnico del campo (ej: "stockEPP", "fechaVigenciaDesde", "codigo_postal")
 * @returns Nombre formateado y amigable para el usuario
 */
export function formatNombreCampo(campo: string): string {
  if (!campo) return "";

  // 1. Coincidencia directa en el diccionario
  const labelDirecta = DICCIONARIO_CAMPOS[campo];
  if (labelDirecta) {
    return labelDirecta;
  }

  // 2. Coincidencia sin distinguir mayúsculas/minúsculas
  const matchCaseInsensitive = Object.entries(DICCIONARIO_CAMPOS).find(
    ([k]) => k.toLowerCase() === campo.toLowerCase(),
  );
  if (matchCaseInsensitive) {
    return matchCaseInsensitive[1];
  }

  // 3. Fallback inteligente: separa camelCase, snake_case y kebab-case
  const palabras = campo
    // Separa cambios de minúscula a mayúscula (ej: fechaVigencia -> fecha Vigencia)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    // Separa siglas consecutivas seguidas de minúscula (ej: EPPStock -> EPP Stock)
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    // Reemplaza guiones y guiones bajos por espacios
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/);

  if (palabras.length === 0) return campo;

  // Capitaliza cada palabra respetando siglas conocidas de más de 1 caracter en mayúsculas
  const palabrasCapitalizadas = palabras.map((palabra) => {
    // Si la palabra ya era una sigla en mayúsculas (ej: EPP, DNI, CUIT, ID), preservarla
    if (palabra.length > 1 && palabra === palabra.toUpperCase()) {
      return palabra;
    }
    return (
      palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
    );
  });

  return palabrasCapitalizadas.join(" ");
}

/**
 * Formatea un valor primitivo para mostrar en el diff de auditoría.
 * - null / undefined / "" -> "—"
 * - "true" / "false" -> "Sí" / "No"
 * - Strings con forma de fecha ISO (YYYY-MM-DD o con hora) -> fecha legible es-AR
 */
export function formatValorAuditoria(valor: string | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") {
    return "—";
  }
  const trimmed = valor.trim();
  if (trimmed === "true") return "Sí";
  if (trimmed === "false") return "No";

  // Fecha corta ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    return `${d}/${m}/${y}`;
  }

  // Fecha y hora ISO (con o sin milisegundos y zona horaria)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/.test(trimmed)) {
    try {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      }
    } catch {
      return valor;
    }
  }

  return valor;
}

