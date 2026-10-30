import { Printer } from "lucide-react";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import {
  Button,
  Spinner,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import {
  puedeImprimirRemito,
  useAbrirRemitoEntrega,
} from "../hooks/useAbrirRemitoEntrega";

interface ImprimirRemitoButtonProps {
  entregaId: number;
  /** Ícono con tooltip para columnas de tabla; si no, botón con texto. */
  soloIcono?: boolean;
}

/**
 * Abre el remito PDF de una entrega de EPP.
 * Si el usuario no es ROLE_ADMIN ni ROLE_RRHH, retorna null.
 */
export function ImprimirRemitoButton({
  entregaId,
  soloIcono = false,
}: ImprimirRemitoButtonProps) {
  const rol = useSessionStore((state) => state.user?.rol);
  const remito = useAbrirRemitoEntrega();
  if (!puedeImprimirRemito(rol)) return null;

  const label = "Imprimir remito";

  if (soloIcono) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-foreground-muted hover:bg-primary-soft hover:text-primary"
            onClick={() => void remito.abrir(entregaId)}
            disabled={remito.isPending}
            aria-label={label}
          >
            {remito.isPending ? (
              <Spinner className="size-3.5" label="Generando remito" />
            ) : (
              <Printer className="size-3.5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      onClick={() => void remito.abrir(entregaId)}
      disabled={remito.isPending}
    >
      {remito.isPending ? (
        <Spinner className="size-4 text-white" label="Generando remito" />
      ) : (
        <Printer className="size-4" />
      )}
      {label}
    </Button>
  );
}
