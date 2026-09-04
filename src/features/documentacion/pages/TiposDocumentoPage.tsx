import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/shared/components";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import {
  useBajaTipoDocumento,
} from "../hooks/useDocumentacion";
import { TiposDocumentoTable } from "../components/TiposDocumentoTable";
import type { TipoDocumentoDTO } from "../types/documentacion.types";

// ─── Página ───────────────────────────────────────────────────────────────────

export default function TiposDocumentoPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoDocumentoDTO | null>(null);
  const [bajaTipo, setBajaTipo] = useState<TipoDocumentoDTO | null>(null);

  const bajaMutation = useBajaTipoDocumento();

  const handleConfirmarBaja = async () => {
    if (!bajaTipo) return;
    try {
      await bajaMutation.mutateAsync(bajaTipo.idTipoDocumento);
      toast.success(`Tipo "${bajaTipo.nombre}" dado de baja correctamente.`);
      setBajaTipo(null);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo dar de baja el tipo.").message,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Encabezado ── */}
      <PageHeader
        title="Tipos de documento"
        description="Parametrización de los tipos de documentación del sistema."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Nuevo tipo
          </Button>
        }
      />

      {/* ── Tabla ── */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <FileText className="size-5 text-primary" />
          <h2 className="font-semibold">Tipos registrados</h2>
        </div>

        <TiposDocumentoTable
          onEdit={setEditingTipo}
          onBaja={setBajaTipo}
        />
      </Card>

      {/* ── Dialog: Nuevo tipo ──
          TODO: reemplazar el contenido por el formulario TipoDocumentoForm
          cuando esté implementado. Por ahora sirve como placeholder estructural.
      */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
                <Plus className="size-5" />
              </span>
              <div>
                <DialogTitle>Nuevo tipo de documento</DialogTitle>
                <DialogDescription>
                  Completá los datos para crear un nuevo tipo.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {/* TODO: <TipoDocumentoForm onSuccess={() => setCreateOpen(false)} /> */}
          <p className="py-6 text-center text-sm text-foreground-muted">
            Formulario de creación en desarrollo.
          </p>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Editar tipo ──
          TODO: reemplazar por TipoDocumentoForm con defaultValues={editingTipo}
      */}
      <Dialog open={Boolean(editingTipo)} onOpenChange={(o) => { if (!o) setEditingTipo(null); }}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <FileText className="size-5" />
              </span>
              <div>
                <DialogTitle>Editar tipo de documento</DialogTitle>
                <DialogDescription>{editingTipo?.nombre}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {/* TODO: <TipoDocumentoForm tipo={editingTipo} onSuccess={() => setEditingTipo(null)} /> */}
          <p className="py-6 text-center text-sm text-foreground-muted">
            Formulario de edición en desarrollo.
          </p>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Confirmar baja ── */}
      <Dialog
        open={Boolean(bajaTipo)}
        onOpenChange={(o) => { if (!o) setBajaTipo(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar de baja tipo de documento</DialogTitle>
            <DialogDescription>
              ¿Confirmás que querés dar de baja el tipo{" "}
              <strong className="text-foreground">{bajaTipo?.nombre}</strong>?
              Esta acción lo desactivará del sistema.
            </DialogDescription>
          </DialogHeader>
          {bajaTipo?.procesarEnRag ? (
            <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              ⚠ Este tipo está configurado para indexación IA (RAG). Darlo de
              baja puede afectar la búsqueda inteligente.
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setBajaTipo(null)}
              disabled={bajaMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarBaja}
              disabled={bajaMutation.isPending}
            >
              {bajaMutation.isPending ? "Procesando..." : "Confirmar baja"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
