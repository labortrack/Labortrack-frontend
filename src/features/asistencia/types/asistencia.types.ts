export type EstadoAsistencia =
  | "PENDIENTE_INGRESO"
  | "PRESENTE"
  | "EGRESADO"
  | "AUSENTE"
  | "AUSENCIA_JUSTIFICADA"
  | "NO_TRABAJADA_COMPUTABLE"
  | "ANULADA";

export type TipoAsistencia = "QR" | "REGISTRO_MANUAL";

export type TipoJornada =
  | "HABIL"
  | "SABADO"
  | "DOMINGO"
  | "FERIADO"
  | "NO_LABORABLE";

export type EstadoJornadaTrabajo =
  | "PROGRAMADA"
  | "NO_TRABAJADA"
  | "EN_CURSO"
  | "FINALIZADA"
  | "ANULADA";

export type AccionAsistenciaPropia =
  | "REGISTRAR_INGRESO_QR"
  | "REGISTRAR_EGRESO_QR"
  | "NINGUNA";

export type AccionAsistenciaOperativa =
  | "REGISTRAR_INGRESO_MANUAL"
  | "REGISTRAR_EGRESO_MANUAL"
  | "REGULARIZAR_ASISTENCIA_OMITIDA"
  | "ANULAR_INGRESO"
  | "ANULAR_EGRESO"
  | "ANULAR_ASISTENCIA";

export type AlcanceParteDiario = "GLOBAL" | "OBRA" | "CUADRILLA";

export interface ParteDiarioCapacidadResponseDto {
  puedeConsultar: boolean;
  alcance: AlcanceParteDiario | null;
  obraIdPredeterminada: number | null;
  cuadrillaIdPredeterminada: number | null;
}

export interface CapacidadesAsistenciaResponseDto {
  puedeConsultarMisAsistencias: boolean;
  parteDiario: ParteDiarioCapacidadResponseDto;
}

export interface PeriodoDisponibleAsistenciaResponseDto {
  anioDesde: number;
  anioHasta: number;
}

export interface ObraAsistenciaResponseDto {
  id: number;
  nombre: string;
  nomenclatura: string;
  pais: string;
  provincia: string;
  localidad: string;
}

export interface RegistroAsistenciaResponseDto {
  fechaHora: string;
  tipo: TipoAsistencia;
}

export interface EstadoAsistenciaHistorialResponseDto {
  estado: EstadoAsistencia;
  fechaHoraDesde: string;
  fechaHoraHasta: string | null;
  observacion: string | null;
  usuarioResponsableId: number | null;
  usuarioResponsable: string | null;
}

export interface AsistenciaHoyResponseDto {
  id: number;
  fecha: string;
  obra: ObraAsistenciaResponseDto;
  cuadrillaId: number;
  cuadrilla: string;
  tipoJornada: TipoJornada;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  estado: EstadoAsistencia;
  ingreso: RegistroAsistenciaResponseDto | null;
  egreso: RegistroAsistenciaResponseDto | null;
  accionDisponible: AccionAsistenciaPropia;
}

export interface AsistenciaHistorialResponseDto {
  id: number;
  fecha: string;
  obra: ObraAsistenciaResponseDto;
  cuadrillaId: number;
  cuadrilla: string;
  fechaHoraIngreso: string | null;
  fechaHoraEgreso: string | null;
  estado: EstadoAsistencia;
}

export interface AsistenciaDetalleResponseDto {
  id: number;
  fecha: string;
  empleadoId: number;
  trabajador: string;
  obra: ObraAsistenciaResponseDto;
  cuadrillaId: number;
  cuadrilla: string;
  tipoJornada: TipoJornada;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  estado: EstadoAsistencia;
  ingreso: RegistroAsistenciaResponseDto | null;
  egreso: RegistroAsistenciaResponseDto | null;
  historialEstados: EstadoAsistenciaHistorialResponseDto[];
}

export type TipoOperacionQr = "ingreso" | "egreso";

export interface ValidarQrRequestDto {
  tokenQr: string;
}

export interface ConfirmarQrRequestDto extends ValidarQrRequestDto {
  asistenciaId: number;
}

export interface ConfirmacionIngresoQrResponseDto {
  asistenciaId: number;
  obra: ObraAsistenciaResponseDto;
  fecha: string;
  fechaHoraValidacion: string;
  empleadoId: number;
  trabajador: string;
  cuadrillaId: number;
  cuadrilla: string;
  estadoActual: EstadoAsistencia;
}

export interface ConfirmacionEgresoQrResponseDto
  extends ConfirmacionIngresoQrResponseDto {
  fechaHoraIngreso: string;
}

export type ConfirmacionQrResponseDto =
  | ConfirmacionIngresoQrResponseDto
  | ConfirmacionEgresoQrResponseDto;

export interface RegistrarIngresoManualRequestDto {
  horaIngreso: string;
  motivo: string;
}

export interface RegistrarEgresoManualRequestDto {
  horaEgreso: string;
  motivo: string;
}

export interface RegistroIngresoManualResponseDto {
  asistenciaId: number;
  fechaHoraIngreso: string;
  tipoIngreso: TipoAsistencia;
  estadoActual: EstadoAsistencia;
}

export interface RegistroEgresoManualResponseDto {
  asistenciaId: number;
  fechaHoraEgreso: string;
  tipoEgreso: TipoAsistencia;
  estadoActual: EstadoAsistencia;
}

export type RegistroManualResponseDto =
  | RegistroIngresoManualResponseDto
  | RegistroEgresoManualResponseDto;

export type TipoRegistroManual = "ingreso" | "egreso";

export interface ParteDiarioFiltros {
  fecha: string;
  obraId?: number;
  cuadrillaId?: number;
  estado?: EstadoAsistencia;
  trabajador?: string;
}

export interface ResumenParteDiarioResponseDto {
  totalEsperadas: number;
  pendientesIngreso: number;
  presentes: number;
  egresadas: number;
  ausentes: number;
  ausenciasJustificadas: number;
  noTrabajadasComputables: number;
  anuladas: number;
}

export interface AsistenciaParteDiarioResponseDto {
  id: number;
  fotoTrabajador: string | null;
  trabajador: string;
  obra: ObraAsistenciaResponseDto;
  cuadrillaId: number;
  cuadrilla: string;
  fechaHoraIngreso: string | null;
  fechaHoraEgreso: string | null;
  estado: EstadoAsistencia;
}

export interface ParteDiarioResponseDto {
  fecha: string;
  resumen: ResumenParteDiarioResponseDto;
  asistencias: AsistenciaParteDiarioResponseDto[];
  mensaje: string | null;
}

export interface ObraFiltroAsistenciaResponseDto {
  id: number;
  nombre: string;
  nomenclatura: string;
}

export interface CuadrillaFiltroAsistenciaResponseDto {
  id: number;
  nombre: string;
  obraId: number;
}

export interface OpcionesFiltroAsistenciaResponseDto {
  fecha: string;
  obras: ObraFiltroAsistenciaResponseDto[];
  cuadrillas: CuadrillaFiltroAsistenciaResponseDto[];
}

export interface AsistenciaOperativaDetalleResponseDto {
  id: number;
  fecha: string;
  fotoTrabajador: string | null;
  trabajador: string;
  obra: ObraAsistenciaResponseDto;
  cuadrillaId: number;
  cuadrilla: string;
  jornadaId: number;
  tipoJornada: TipoJornada;
  estadoJornada: EstadoJornadaTrabajo;
  horaInicioPlanificada: string;
  horaFinPlanificada: string;
  estado: EstadoAsistencia;
  ingreso: RegistroAsistenciaResponseDto | null;
  egreso: RegistroAsistenciaResponseDto | null;
  historialEstados: EstadoAsistenciaHistorialResponseDto[];
  accionesDisponibles: AccionAsistenciaOperativa[];
}
