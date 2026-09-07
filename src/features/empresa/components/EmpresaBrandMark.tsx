import { Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import type { Empresa } from "../types/empresa.types";

interface EmpresaBrandMarkProps {
  empresa: Empresa | undefined;
  showLabel: boolean;
}

export function EmpresaBrandMark({ empresa, showLabel }: EmpresaBrandMarkProps) {
  const nombre = empresa?.nombreEmpresa || "LaborTrack";
  const logoUrl = empresa?.urlLogotipoEmpresa;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Dialog>
        {logoUrl ? (
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg transition hover:opacity-80"
              aria-label={`Ver logotipo de ${nombre} en tamaño completo`}
            >
              <img
                src={logoUrl}
                alt={`Logotipo de ${nombre}`}
                className="size-full object-contain"
              />
            </button>
          </DialogTrigger>
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Building2 className="size-6" strokeWidth={1.75} />
          </span>
        )}
        <DialogContent className="flex max-w-md flex-col items-center gap-4">
          <DialogTitle>{nombre}</DialogTitle>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`Logotipo de ${nombre}`}
              className="max-h-[60vh] w-full object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
      {showLabel ? (
        <div className="min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate text-lg font-medium">{nombre}</div>
            </TooltipTrigger>
            <TooltipContent side="bottom">{nombre}</TooltipContent>
          </Tooltip>
          <div className="truncate text-[11px] text-foreground-muted">
            Control de Personal
          </div>
        </div>
      ) : null}
    </div>
  );
}
