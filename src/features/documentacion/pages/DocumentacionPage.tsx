import { useState } from "react";
import { FileUp, Files, Search, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SearchInput } from "@/shared/components";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useBajaDocumento } from "../hooks/useDocumentacion";
import { DocumentosTable } from "../components/DocumentosTable";
import { UploadDocumentoForm } from "../components/UploadDocumentoForm";
import type { DocumentoFilterDto, DocumentoRespuestaDto } from "../types/documentacion.types";

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DocumentacionPage() {
  // ── RBAC ───────────────────────────────────────────────────────────────────
  const user = useSessionStore((state) => state.user);
  const puedeSubir =
    user?.rol === "ROLE_ADMIN" || user?.rol === "ROLE_RRHH";

  // ── Estado local ───────────────────────────────────────────────────────────
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bajaDoc, setBajaDoc] = useState<DocumentoRespuestaDto | null>(null);
  const [nombreFiltro, setNombreFiltro] = useState("");
  const [filters, setFilters] = useState<DocumentoFilterDto>({});

  const bajaMutation = useBajaDocumento();

  // ── Handlers ───────────────────────────────────────────────────────────────

  const applySearch = () => {
    setFilters(
      nombreFiltro.trim() ? { nombreDocumento: nombreFiltro.trim() } : {},
    );
  };

  const clearSearch = () => {
    setNombreFiltro("");
    setFilters({});
  };

  const handlePrevisualizar = (doc: DocumentoRespuestaDto) => {
    // TODO: abrir panel lateral o modal con iframe/PDF viewer
    toast.info(`Previsualización de "${doc.nombreDocumento}" próximamente.`);
  };

  const handleDescargar = (doc: DocumentoRespuestaDto) => {
    // El pathMinio es la URL de descarga directa (o presigned URL del backend).
    window.open(doc.pathMinio, "_blank", "noopener,noreferrer");
  };

  const handleConfirmarBaja = async () => {
    if (!bajaDoc) return;
    try {
      await bajaMutation.mutateAsync(bajaDoc.idDocumento);
      toast.success(`"${bajaDoc.nombreDocumento}" dado de baja correctamente.`);
      setBajaDoc(null);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo dar de baja el documento.").message,
      );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Encabezado ── */}
      <PageHeader
        title="Documentación"
        description="Gestión y visualización de documentos del sistema."
        actions={
          puedeSubir ? (
            <Button onClick={() => setUploadOpen(true)}>
              <FileUp />
              Subir documento
            </Button>
          ) : undefined
        }
      />

      {/* ── Barra de búsqueda ── */}
      <Card>
        <CardContent>
          <div className="flex gap-2">
            <SearchInput
              placeholder="Buscar por nombre de documento..."
              aria-label="Buscar documento"
              value={nombreFiltro}
              onChange={(e) => setNombreFiltro(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              className="flex-1"
            />
            <Button onClick={applySearch}>
              <Search />
              Buscar
            </Button>
            <Button variant="outline" size="icon" onClick={clearSearch} aria-label="Limpiar búsqueda">
              <RotateCcw />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabla de documentos ── */}
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Files className="size-5 text-primary" />
          <h2 className="font-semibold">Documentos</h2>
          {Object.keys(filters).length > 0 ? (
            <Badge variant="outline" className="ml-auto text-xs">
              Filtrado
            </Badge>
          ) : null}
        </div>

        <DocumentosTable
          filters={filters}
          onPrevisualizar={handlePrevisualizar}
          onDescargar={handleDescargar}
          onBaja={setBajaDoc}
        />
      </Card>

      {/* ── Dialog: Subir documento ── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-white">
                <FileUp className="size-5" />
              </span>
              <div>
                <DialogTitle>Subir documento</DialogTitle>
                <DialogDescription>
                  Seleccioná el tipo y adjuntá el archivo.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <UploadDocumentoForm onSuccess={() => setUploadOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Confirmar baja ── */}
      <Dialog
        open={Boolean(bajaDoc)}
        onOpenChange={(o) => { if (!o) setBajaDoc(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar de baja documento</DialogTitle>
            <DialogDescription>
              ¿Confirmás que querés dar de baja el documento{" "}
              <strong className="text-foreground">
                {bajaDoc?.nombreDocumento}
              </strong>
              ? El archivo dejará de estar disponible en el sistema.
            </DialogDescription>
          </DialogHeader>
          {bajaDoc?.esIndexadoRag ? (
            <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              ⚠ Este documento está indexado en el motor IA (RAG). Darlo de baja
              lo eliminará de las búsquedas inteligentes.
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setBajaDoc(null)}
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
