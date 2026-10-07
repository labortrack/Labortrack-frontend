import type { MouseEvent } from "react";
import { History } from "lucide-react";
import {
  Button,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { useSessionStore } from "@/features/auth/store/sessionStore";

export interface HistorialAuditoriaMenuItemProps {
  onAbrir: () => void;
  className?: string;
  conSeparador?: boolean;
}

/**
 * Ítem de DropdownMenu para abrir el historial.
 * No instancia el hook por su cuenta: recibe la función onAbrir desde el contenedor.
 * Si el usuario no es ROLE_ADMIN, retorna null.
 */
export function HistorialAuditoriaMenuItem({
  onAbrir,
  className = "",
  conSeparador = true,
}: HistorialAuditoriaMenuItemProps) {
  const esAdmin = useSessionStore((state) => state.user?.rol === "ROLE_ADMIN");
  if (!esAdmin) return null;

  return (
    <>
      {conSeparador && <DropdownMenuSeparator />}
      <DropdownMenuItem
        onSelect={(e) => {
          e.stopPropagation();
          onAbrir();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={`gap-2 cursor-pointer ${className}`}
      >
        <History className="size-4 text-foreground-muted" />
        Ver historial
      </DropdownMenuItem>
    </>
  );
}

export interface HistorialAuditoriaIconButtonProps {
  onAbrir: () => void;
  className?: string;
  label?: string;
}

/**
 * Botón con ícono para columnas de tabla con botones sueltos (ej: EppTable).
 * No instancia el hook por su cuenta: recibe la función onAbrir desde el contenedor.
 * Si el usuario no es ROLE_ADMIN, retorna null.
 */
export function HistorialAuditoriaIconButton({
  onAbrir,
  className = "",
  label = "Ver historial",
}: HistorialAuditoriaIconButtonProps) {
  const esAdmin = useSessionStore((state) => state.user?.rol === "ROLE_ADMIN");
  if (!esAdmin) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={`size-8 text-foreground-muted hover:bg-primary-soft hover:text-primary ${className}`}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onAbrir();
          }}
          aria-label={label}
        >
          <History className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export interface HistorialAuditoriaButtonProps {
  onAbrir: () => void;
  className?: string;
  label?: string;
}

/**
 * Botón con ícono y texto para cabeceras o barras de acciones (ej: PageHeader en MiEmpresaPage).
 * No instancia el hook por su cuenta: recibe la función onAbrir desde el contenedor.
 * Si el usuario no es ROLE_ADMIN, retorna null.
 */
export function HistorialAuditoriaButton({
  onAbrir,
  className = "",
  label = "Historial de cambios",
}: HistorialAuditoriaButtonProps) {
  const esAdmin = useSessionStore((state) => state.user?.rol === "ROLE_ADMIN");
  if (!esAdmin) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onAbrir();
      }}
    >
      <History className="size-4 text-foreground-muted" />
      <span>{label}</span>
    </Button>
  );
}

