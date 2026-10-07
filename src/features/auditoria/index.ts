// Componente Principal y Diálogo
export { HistorialAuditoria } from "./components/HistorialAuditoria";
export type { HistorialAuditoriaProps } from "./components/HistorialAuditoria";
export { HistorialAuditoriaDialog } from "./components/HistorialAuditoriaDialog";
export type { HistorialAuditoriaDialogProps } from "./components/HistorialAuditoriaDialog";
export { useHistorialAuditoriaDialog } from "./hooks/useHistorialAuditoriaDialog";
export type { AuditoriaTarget } from "./hooks/useHistorialAuditoriaDialog";
export { useEsAdminAuditoria } from "./hooks/useEsAdminAuditoria";
export {
  HistorialAuditoriaMenuItem,
  HistorialAuditoriaIconButton,
  HistorialAuditoriaButton,
} from "./components/HistorialAuditoriaTriggers";
export type {
  HistorialAuditoriaMenuItemProps,
  HistorialAuditoriaIconButtonProps,
  HistorialAuditoriaButtonProps,
} from "./components/HistorialAuditoriaTriggers";

// Tipos
export type {
  AuditoriaLogDTO,
  CambioCampoDTO,
  OperacionAuditoria,
  AuditoriaFeedItem,
  AuditoriaFeedPage,
  AuditoriaFeedFiltros,
} from "./types/auditoria.types";

// Constantes y Utilidades de Entidades
export {
  DICCIONARIO_ENTIDADES_OVERRIDE,
  formatNombreEntidad,
  CAMPOS_OCULTOS,
} from "./constants/entidades.constants";
export type { EntidadAuditable } from "./constants/entidades.constants";

// Diccionario y utilidades de campos
export {
  DICCIONARIO_CAMPOS,
  formatNombreCampo,
  formatValorAuditoria,
} from "./utils/campoDictionary";

// API y Hooks
export {
  auditoriaApi,
  obtenerEntidadesAuditables,
  obtenerHistorial,
  obtenerCambios,
} from "./api/auditoria.api";
export {
  useAuditoria,
  useHistorialAuditoria,
  useEntidadesAuditables,
  useCambiosAuditoria,
  auditoriaKeys,
} from "./hooks/useAuditoria";
export type { UseCambiosAuditoriaFiltros } from "./hooks/useAuditoria";

