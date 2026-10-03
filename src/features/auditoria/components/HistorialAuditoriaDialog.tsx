import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { HistorialAuditoria } from "./HistorialAuditoria";

export interface HistorialAuditoriaDialogProps {
  entidad: string;
  id: number;
  titulo: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistorialAuditoriaDialog({
  entidad,
  id,
  titulo,
  open,
  onOpenChange,
}: HistorialAuditoriaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[69]"
        className="z-[70] flex max-h-[85vh] w-[calc(100%-2rem)] max-w-3xl flex-col overflow-hidden p-0 sm:max-w-2xl md:max-w-3xl"
      >
        <DialogHeader className="shrink-0 border-b border-border p-6 pb-4 pr-12 mb-0">
          <DialogTitle className="text-lg font-bold text-foreground">
            Historial de cambios — {titulo}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <HistorialAuditoria entidad={entidad} id={id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
