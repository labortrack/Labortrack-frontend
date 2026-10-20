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

  // Tablas de estado (asistencia, solicitud, empleado, cuadrilla, jornada, recibo)
  fechaHoraDesde: "Vigente desde",
  fechaHoraHasta: "Vigente hasta",
  fechaDesde: "Fecha desde",
  fechaHasta: "Fecha hasta",
  observacion: "Observación",
  estadoAsistencia: "Estado de la asistencia",
  estadoSolicitudAusencia: "Estado de la solicitud",
  estadoEmpleado: "Estado del empleado",
  estadoCuadrilla: "Estado de la cuadrilla",
  estadoJornadaTrabajo: "Estado de la jornada",
  estadoReciboSueldo: "Estado del recibo",
  motivoJornadaTrabajoEstado: "Motivo",

  // Asistencia, ingreso y egreso
  fechaAsistencia: "Fecha de la asistencia",
  fechaHoraIngreso: "Hora de ingreso",
  fechaHoraEgreso: "Hora de egreso",
  tipoAsistencia: "Tipo de registro",

  // Jornadas y planes de trabajo
  fechaJornadaTrabajo: "Fecha de la jornada",
  horaInicioPlanificada: "Hora de inicio planificada",
  horaFinPlanificada: "Hora de fin planificada",
  esExtraordinaria: "Jornada extraordinaria",
  tipoJornada: "Tipo de jornada",
  decisionDiaNoLaborable: "Decisión sobre día no laborable",
  fechaHoraCancelacion: "Fecha de cancelación",
  tipoCierre: "Tipo de cierre",
  motivoCierre: "Motivo del cierre",
  fechaHoraCierre: "Fecha de cierre",
  fechaVigenciaHastaOriginal: "Fin de vigencia original",

  // Recibos de sueldo
  fechaRecibo: "Fecha del recibo",
  cantidadDeHoras: "Cantidad de horas",
  valorHoraBasico: "Valor hora básico",
  valorHoraAdicional: "Valor hora adicional",
  valorHoraTotal: "Valor hora total",
  sumaNoRemunerativa: "Suma no remunerativa",
  totalRemunerativo: "Total remunerativo",
  totalNoRemunerativo: "Total no remunerativo",
  totalBruto: "Total bruto",
  totalNeto: "Total neto",
  fechaHoraLectura: "Fecha de lectura",
  descripcionDetalle: "Descripción",
  columnaRecibo: "Columna del recibo",
  cantidadDetalle: "Cantidad",
  valorDetalle: "Valor",

  // Legajo del empleado
  numeroIeric: "N° IERIC",
  grupoSanguineo: "Grupo sanguíneo",
  domicilio: "Domicilio",
  numeroCelular: "Celular",
  nombreContactoEmergencia: "Contacto de emergencia",
  celularContactoEmergencia: "Celular de emergencia",
  fotoPerfilKey: "Foto de perfil",

  // Documentos
  nombreDocumento: "Nombre del documento",
  nombreArchivoOriginal: "Archivo original",
  visibilidad: "Visibilidad",
  usuarioSubidaId: "Usuario que lo subió (ID)",
  contentType: "Tipo de archivo",

  // Empresa
  nombreEmpresa: "Nombre de la empresa",
  direccionEmpresa: "Dirección",
  emailEmpresa: "Correo electrónico",
  nroIericEmpresa: "N° IERIC de la empresa",
  urlLogotipoEmpresa: "Logotipo",

  // Usuario (cuenta)
  enabled: "Cuenta habilitada",
  accountNonExpired: "Cuenta vigente",
  accountNonLocked: "Cuenta no bloqueada",
  credentialsNonExpired: "Credenciales vigentes",
  motivoBaja: "Motivo de baja",
};

/**
 * Etiquetas legibles para los valores de enums que el backend devuelve crudos en los cambios
 * (por ejemplo "REGISTRO_MANUAL"). La clave externa es el nombre del campo; si el campo o el
 * valor no figuran acá, se muestra el valor tal como llegó.
 */
export const VALORES_ENUM_POR_CAMPO = {
  tipoAsistencia: { QR: "QR", REGISTRO_MANUAL: "Registro manual" },
  estadoAsistencia: {
    PENDIENTE_INGRESO: "Pendiente de ingreso",
    PRESENTE: "Presente",
    EGRESADO: "Egresado",
    AUSENTE: "Ausente",
    AUSENCIA_JUSTIFICADA: "Ausencia justificada",
    NO_TRABAJADA_COMPUTABLE: "No trabajada (computable)",
    ANULADA: "Anulada",
  },
  estadoSolicitudAusencia: {
    EN_REVISION: "En revisión",
    ACEPTADA: "Aceptada",
    RECHAZADA: "Rechazada",
    REVOCADA: "Revocada",
  },
  estadoEmpleado: {
    ACTIVO: "Activo",
    INACTIVO: "Inactivo",
    EN_OBRA: "En obra",
    LICENCIA: "Licencia",
  },
  estadoCuadrilla: {
    PLANIFICADA: "Planificada",
    EN_ESPERA: "En espera",
    ACTIVA: "Activa",
    FINALIZADA: "Finalizada",
    SUSPENDIDA: "Suspendida",
  },
  estadoJornadaTrabajo: {
    PROGRAMADA: "Programada",
    NO_TRABAJADA: "No trabajada",
    EN_CURSO: "En curso",
    FINALIZADA: "Finalizada",
    ANULADA: "Anulada",
  },
  tipoJornada: {
    HABIL: "Hábil",
    SABADO: "Sábado",
    DOMINGO: "Domingo",
    FERIADO: "Feriado",
    NO_LABORABLE: "No laborable",
  },
  decisionDiaNoLaborable: {
    NO_APLICA: "No aplica",
    SE_TRABAJA: "Se trabaja",
    NO_SE_TRABAJA: "No se trabaja",
  },
  estadoReciboSueldo: {
    BORRADOR: "Borrador",
    GENERADO: "Generado",
    PENDIENTE_LECTURA: "Pendiente de lectura",
    LEIDO: "Leído",
    CANCELADO: "Cancelado",
  },
  columnaRecibo: {
    REMUNERATIVO: "Remunerativo",
    NO_REMUNERATIVO: "No remunerativo",
    DEDUCCION: "Deducción",
  },
  tipoCierre: {
    CANCELACION: "Cancelación",
    FINALIZACION_ANTICIPADA: "Finalización anticipada",
  },
  visibilidad: {
    PUBLICO: "Público",
    RRHH: "RRHH",
    EMPLEADO: "Empleado",
    PRIVADO: "Privado",
  },
  genero: { MASCULINO: "Masculino", FEMENINO: "Femenino", OTRO: "Otro" },
  rol: {
    ROLE_ADMIN: "Administrador",
    ROLE_RRHH: "Recursos Humanos",
    ROLE_OPERARIO: "Operario",
  },
} as const satisfies Record<string, Readonly<Record<string, string>>>;

export type CampoConValoresEnum = keyof typeof VALORES_ENUM_POR_CAMPO;

/** Devuelve la etiqueta del valor de un enum, o undefined si el campo/valor no está mapeado. */
export function etiquetaValorEnum(campo: string, valor: string): string | undefined {
  if (!Object.hasOwn(VALORES_ENUM_POR_CAMPO, campo)) return undefined;
  const valores: Readonly<Record<string, string>> =
    VALORES_ENUM_POR_CAMPO[campo as CampoConValoresEnum];
  return Object.hasOwn(valores, valor) ? valores[valor] : undefined;
}

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
 * - Valores de enums conocidos (si se indica el campo) -> etiqueta de VALORES_ENUM_POR_CAMPO
 */
export function formatValorAuditoria(
  valor: string | null | undefined,
  campo?: string,
): string {
  if (valor === null || valor === undefined || valor === "") {
    return "—";
  }
  const trimmed = valor.trim();
  if (trimmed === "true") return "Sí";
  if (trimmed === "false") return "No";

  if (campo) {
    const etiquetaEnum = etiquetaValorEnum(campo, trimmed);
    if (etiquetaEnum) return etiquetaEnum;
  }

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

