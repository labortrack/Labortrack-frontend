import { useState } from "react";
import {
  FileUp,
  Files,
  FileText,
  FolderArchive,
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
import {
  useBajaDocumento,
  useBajaTipoDocumento,
  useReactivarTipoDocumento,
} from "../hooks/useDocumentacion";
import { DocumentosTable } from "../components/DocumentosTable";
import { MiDocumentacionTable } from "../components/MiDocumentacionTable";
import { UploadDocumentoForm } from "../components/UploadDocumentoForm";
import { TiposDocumentoTable } from "../components/TiposDocumentoTable";
import { TipoDocumentoFormModal } from "../components/TipoDocumentoFormModal";
import { Documento360Modal } from "../components/Documento360Modal";
import { TipoDocumento360Modal } from "../components/TipoDocumento360Modal";
import type {
  DocumentoFilterDto,
  DocumentoRespuestaDto,
  TipoDocumentoDTO,
} from "../types/documentacion.types";

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
  const [reactivarTipo, setReactivarTipo] = useState<TipoDocumentoDTO | null>(null);

  const bajaTipoMutation = useBajaTipoDocumento();
  const reactivarTipoMutation = useReactivarTipoDocumento();

  const handleConfirmarBajaTipo = async () => {
    const id = bajaTipo?.idTipoDocumento ?? bajaTipo?.id;
    if (!id) return;
    try {
      await bajaTipoMutation.mutateAsync(id);
      toast.success(`Tipo "${bajaTipo?.nombre}" dado de baja correctamente.`);
      setBajaTipo(null);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo dar de baja el tipo.").message,
      );
    }
  };

  const handleReactivarTipo = (tipo: TipoDocumentoDTO) => {
    setReactivarTipo(tipo);
  };

  const handleConfirmarReactivarTipo = async () => {
    const id = reactivarTipo?.idTipoDocumento ?? reactivarTipo?.id;
    if (!id) return;
    try {
      await reactivarTipoMutation.mutateAsync(id);
      toast.success(`Tipo "${reactivarTipo?.nombre}" reactivado exitosamente.`);
      setReactivarTipo(null);
    } catch (error) {
      toast.error(
        normalizeApiError(
          error,
          "No se pudo reactivar el tipo de documento.",
        ).message,
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
      <Tabs defaultValue="mis-documentos">
        <TabsList>
          <TabsTrigger value="mis-documentos">
            Mis Documentos
          </TabsTrigger>
          <TabsTrigger value="institucionales">
            Documentos Institucionales
          </TabsTrigger>
          {esAdmin && (
            <TabsTrigger value="tipos">Administrar Tipos</TabsTrigger>
          )}
        </TabsList>

        {/* ══ Tab: Mis Documentos ══ */}
        <TabsContent value="mis-documentos">
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
                    placeholder="Buscar en mis documentos..."
                    aria-label="Buscar en mis documentos"
                    value={nombreFiltro}
                    onChange={(e) => setNombreFiltro(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearSearch}
                    aria-label="Limpiar búsqueda"
                  >
                    <RotateCcw />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de mis documentos */}
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <FolderArchive className="size-5 text-primary" />
                <h2 className="font-semibold">Mis Documentos</h2>
                {nombreFiltro.trim() ? (
                  <Badge variant="neutral" className="ml-auto text-xs">
                    Filtrado
                  </Badge>
                ) : null}
              </div>

              <MiDocumentacionTable
                searchTerm={nombreFiltro}
                onPrevisualizar={handlePrevisualizar}
                onBaja={setBajaDoc}
              />
            </Card>
          </div>
        </TabsContent>

        {/* ══ Tab: Documentos Institucionales ══ */}
        <TabsContent value="institucionales">
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearSearch}
                    aria-label="Limpiar búsqueda"
                  >
                    <RotateCcw />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de documentos institucionales */}
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Files className="size-5 text-primary" />
                <h2 className="font-semibold">Documentos Institucionales</h2>
                {Object.keys(filters).length > 0 ? (
                  <Badge variant="neutral" className="ml-auto text-xs">
                    Filtrado
                  </Badge>
                ) : null}
              </div>

              <DocumentosTable
                filters={filters}
                onPrevisualizar={handlePrevisualizar}
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
                  onReactivar={handleReactivarTipo}
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
        onReactivar={handleReactivarTipo}
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
                  Seleccioná un archivo y completá los metadatos para guardarlo.
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
        onOpenChange={(o) => {
          if (!o) setBajaDoc(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dar de baja documento</DialogTitle>
            <DialogDescription>
              ¿Confirmás que querés dar de baja el documento{" "}
              <strong className="text-foreground">
                {bajaDoc?.nombreDocumento}
              </strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {bajaDoc?.esIndexadoRag ? (
            <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              ⚠ Este documento está indexado en el motor de Inteligencia
              Artificial (RAG). Darlo de baja lo eliminará de las búsquedas
              inteligentes.
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

      {/* ══ Modales: Tab Tipos (solo ROLE_ADMIN) ══ */}

      {/* Modal: Crear Tipo de Documento */}
      <TipoDocumentoFormModal
        open={createTipoOpen}
        onOpenChange={setCreateTipoOpen}
      />

      {/* Modal: Editar Tipo de Documento */}
      <TipoDocumentoFormModal
        open={Boolean(editingTipo)}
        onOpenChange={(o) => {
          if (!o) setEditingTipo(null);
        }}
        tipo={editingTipo}
        onSuccess={() => setEditingTipo(null)}
      />

      {/* Dialog: Confirmar baja de tipo */}
      <Dialog
        open={Boolean(bajaTipo)}
        onOpenChange={(o) => {
          if (!o) setBajaTipo(null);
        }}
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

      {/* Dialog: Confirmar reactivación de tipo */}
      <Dialog
        open={Boolean(reactivarTipo)}
        onOpenChange={(o) => {
          if (!o) setReactivarTipo(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivar tipo de documento</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseás reactivar el tipo de documento{" "}
              <strong className="text-foreground">{reactivarTipo?.nombre}</strong>?
              Volverá a estar disponible y operativo para todos los usuarios.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setReactivarTipo(null)}
              disabled={reactivarTipoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmarReactivarTipo}
              disabled={reactivarTipoMutation.isPending}
            >
              {reactivarTipoMutation.isPending ? "Reactivando..." : "Confirmar reactivación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
