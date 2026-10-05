import { useSessionStore } from "@/features/auth/store/sessionStore";

/**
 * Hook mínimo para verificar si el usuario actual posee rol ROLE_ADMIN,
 * centralizando el chequeo para permisos del módulo de auditoría.
 */
export function useEsAdminAuditoria(): boolean {
  return useSessionStore((state) => state.user?.rol === "ROLE_ADMIN");
}
