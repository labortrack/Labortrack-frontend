import { useState } from "react";
import {
  FileUp,
  Files,
  FileText,
  Plus,
  Search,
  RotateCcw,
} from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import { useBajaDocumento, useBajaTipoDocumento } from "../hooks/useDocumentacion";
import { DocumentosTable } from "../components/DocumentosTable";
import { UploadDocumentoForm } from "../components/UploadDocumentoForm";
import { TiposDocumentoTable } from "../components/TiposDocumentoTable";
import { Documento360Modal } from "../components/Documento360Modal";
import { TipoDocumento360Modal } from "../components/TipoDocumento360Modal";
import type { DocumentoFilterDto, DocumentoRespuestaDto, TipoDocumentoDTO } from "../types/documentacion.types";

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DocumentacionPage() {
  // ── RBAC ───────────────────────────────────────────────────────────────────
  const user = useSessionStore((state) => state.user);
  const esAdmin = user?.rol === "ROLE_ADMIN";

  // ── Estado: Tab "Documentos" ────────────────────────────────────────────────
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoRespuestaDto | null>(null);
  const [bajaDoc, setBajaDoc] = useState<DocumentoRespuestaDto | null>(null);
  const [nombreFiltro, setNombreFiltro] = useState("");
  const [filters, setFilters] = useState<DocumentoFilterDto>({});

  const bajaMutation = useBajaDocumento();

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
    setSelectedDoc(doc);
  };

  const handleDescargar = (doc: DocumentoRespuestaDto) => {
    if (doc.pathMinio) {
      window.open(doc.pathMinio, "_blank", "noopener,noreferrer");
    } else {
      toast.info("No hay enlace de descarga directo disponible");
    }
  };

  const handleConfirmarBajaDoc = async () => {
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

  // ── Estado: Tab "Tipos" (solo ROLE_ADMIN) ──────────────────────────────────
  const [createTipoOpen, setCreateTipoOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumentoDTO | null>(null);
  const [editingTipo, setEditingTipo] = useState<TipoDocumentoDTO | null>(null);
  const [bajaTipo, setBajaTipo] = useState<TipoDocumentoDTO | null>(null);

  const bajaTipoMutation = useBajaTipoDocumento();

  const handleConfirmarBajaTipo = async () => {
    if (!bajaTipo) return;
    try {
      await bajaTipoMutation.mutateAsync(bajaTipo.idTipoDocumento);
      toast.success(`Tipo "${bajaTipo.nombre}" dado de baja correctamente.`);
      setBajaTipo(null);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo dar de baja el tipo.").message,
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
      />

      {/* ── Tabs ── */}
      <Tabs defaultValue="documentos">
        <TabsList>
          <TabsTrigger value="documentos">Documentos Cargados</TabsTrigger>
          {esAdmin && (
            <TabsTrigger value="tipos">Administrar Tipos</TabsTrigger>
          )}
        </TabsList>

        {/* ══ Tab: Documentos Cargados ══ */}
        <TabsContent value="documentos">
          <div className="space-y-4">
            {/* Acciones del tab (disponible para todos los roles) */}
            <div className="flex justify-end">
              <Button onClick={() => setUploadOpen(true)}>
                <FileUp />
                Subir documento
              </Button>
            </div>

            {/* Barra de búsqueda */}
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

            {/* Tabla de documentos */}
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Files className="size-5 text-primary" />
                <h2 className="font-semibold">Documentos</h2>
                {Object.keys(filters).length > 0 ? (
                  <Badge variant="neutral" className="ml-auto text-xs">
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
          </div>
        </TabsContent>

        {/* ══ Tab: Administrar Tipos (solo ROLE_ADMIN) ══ */}
        {esAdmin && (
          <TabsContent value="tipos">
            <div className="space-y-4">
              {/* Acción: Nuevo tipo */}
              <div className="flex justify-end">
                <Button onClick={() => setCreateTipoOpen(true)}>
                  <Plus />
                  Nuevo tipo
                </Button>
              </div>

              {/* Tabla de tipos */}
              <Card className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                  <FileText className="size-5 text-primary" />
                  <h2 className="font-semibold">Tipos registrados</h2>
                </div>

                <TiposDocumentoTable
                  onSelect={setSelectedTipo}
                  onEdit={setEditingTipo}
                  onBaja={setBajaTipo}
                />
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* ══ Modales de Vista 360° ══ */}

      {/* Modal 360°: Documento */}
      <Documento360Modal
        doc={selectedDoc}
        open={Boolean(selectedDoc)}
        onOpenChange={(open) => {
          if (!open) setSelectedDoc(null);
        }}
        onDescargar={handleDescargar}
        onBaja={setBajaDoc}
      />

      {/* Modal 360°: Tipo de Documento */}
      <TipoDocumento360Modal
        tipo={selectedTipo}
        open={Boolean(selectedTipo)}
        onOpenChange={(open) => {
          if (!open) setSelectedTipo(null);
        }}
        onEdit={setEditingTipo}
        onBaja={setBajaTipo}
      />

      {/* ══ Dialogs: Tab Documentos ══ */}

      {/* Dialog: Subir documento */}
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

      {/* Dialog: Confirmar baja de documento */}
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
              onClick={handleConfirmarBajaDoc}
              disabled={bajaMutation.isPending}
            >
              {bajaMutation.isPending ? "Procesando..." : "Confirmar baja"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ Dialogs: Tab Tipos (solo ROLE_ADMIN) ══ */}

      {/* Dialog: Nuevo tipo */}
      <Dialog open={createTipoOpen} onOpenChange={setCreateTipoOpen}>
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
          {/* TODO: <TipoDocumentoForm onSuccess={() => setCreateTipoOpen(false)} /> */}
          <p className="py-6 text-center text-sm text-foreground-muted">
            Formulario de creación en desarrollo.
          </p>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar tipo */}
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

      {/* Dialog: Confirmar baja de tipo */}
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
              disabled={bajaTipoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarBajaTipo}
              disabled={bajaTipoMutation.isPending}
            >
              {bajaTipoMutation.isPending ? "Procesando..." : "Confirmar baja"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
