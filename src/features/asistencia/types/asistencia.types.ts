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

export interface CapacidadesAsistenciaResponseDto {
  puedeConsultarMisAsistencias: boolean;
  puedeConsultarParteDiario: boolean;
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
