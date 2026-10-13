import { useState, useMemo } from "react";
import {
  FileUp,
  Files,
  FileText,
  FolderArchive,
  Plus,
} from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { cn } from "@/shared/utils/cn";
import { useSessionStore } from "@/features/auth/store/sessionStore";
import {
  useBajaDocumento,
  useBajaTipoDocumento,
  useReactivarDocumento,
  useReactivarTipoDocumento,
  useTiposDocumentoCompleto,
} from "../hooks/useDocumentacion";
import { useRagIndexingPolling } from "../hooks/useRagIndexingPolling";
import { DocumentosTable } from "../components/DocumentosTable";
import { MiDocumentacionTable } from "../components/MiDocumentacionTable";
import { UploadDocumentoForm } from "../components/UploadDocumentoForm";
import { TiposDocumentoTable } from "../components/TiposDocumentoTable";
import { TipoDocumentoFormModal } from "../components/TipoDocumentoFormModal";
import { Documento360Modal } from "../components/Documento360Modal";
import { TipoDocumento360Modal } from "../components/TipoDocumento360Modal";
import { DocumentosFiltros } from "../components/DocumentosFiltros";
import {
  FILTROS_VACIOS,
  hayFiltrosActivos,
  validarRangoFechas,
  type DocumentosFiltrosValores,
} from "../utils/documentosFiltros";
import type {
  DocumentoFilterDto,
  DocumentoRespuestaDto,
  EstadoDocumentoFiltro,
  TipoDocumentoDTO,
} from "../types/documentacion.types";

const TABS_ESTADO: { label: string; value: EstadoDocumentoFiltro }[] = [
  { label: "Activos", value: "ACTIVOS" },
  { label: "Inactivos", value: "INACTIVOS" },
  { label: "Todos", value: "TODOS" },
];

export default function DocumentacionPage() {
  // ── RBAC ───────────────────────────────────────────────────────────────────
  const user = useSessionStore((state) => state.user);
  const esAdmin = user?.rol === "ROLE_ADMIN";
  const isOperario = user?.rol === "ROLE_OPERARIO";
  // El filtro por empleado es exclusivo de ADMIN / RRHH
  const puedeFiltrarPorEmpleado = esAdmin || user?.rol === "ROLE_RRHH";

  // ── Estado: Tab "Documentos" ────────────────────────────────────────────────
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentoRespuestaDto | null>(null);
  const [bajaDoc, setBajaDoc] = useState<DocumentoRespuestaDto | null>(null);
  const [reactivarDoc, setReactivarDoc] = useState<DocumentoRespuestaDto | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoDocumentoFiltro>("ACTIVOS");

  // Filtros de "Mis Documentos": se aplican en memoria a medida que cambian
  const [filtrosMisDocs, setFiltrosMisDocs] = useState<DocumentosFiltrosValores>(FILTROS_VACIOS);
  const { data: tiposDocumento = [] } = useTiposDocumentoCompleto();
  const tipoMisDocsNombre = tiposDocumento.find(
    (t) => (t.idTipoDocumento ?? t.id) === filtrosMisDocs.tipoDocumentoId,
  )?.nombre;
  const rangoMisDocsValido = !validarRangoFechas(filtrosMisDocs.fechaDesde, filtrosMisDocs.fechaHasta);

  // Filtros de "Documentos Institucionales": se resuelven en el servidor.
  // Tipo, fechas y empleado se aplican al cambiar; el texto, con "Buscar".
  const [filtrosInst, setFiltrosInst] = useState<DocumentosFiltrosValores>(FILTROS_VACIOS);
  const [nombreInstAplicado, setNombreInstAplicado] = useState("");
  const rangoInstValido = !validarRangoFechas(filtrosInst.fechaDesde, filtrosInst.fechaHasta);

  const appliedFilters: DocumentoFilterDto = useMemo(() => ({
    ...(nombreInstAplicado ? { nombreDocumento: nombreInstAplicado } : {}),
    ...(filtrosInst.tipoDocumentoId ? { tipoDocumentoId: filtrosInst.tipoDocumentoId } : {}),
    // Con un rango inválido no se envían fechas: el error ya se muestra en la barra
    ...(rangoInstValido && filtrosInst.fechaDesde ? { fechaDesde: filtrosInst.fechaDesde } : {}),
    ...(rangoInstValido && filtrosInst.fechaHasta ? { fechaHasta: filtrosInst.fechaHasta } : {}),
    ...(puedeFiltrarPorEmpleado && filtrosInst.empleado ? { empleadoId: filtrosInst.empleado.id } : {}),
    ...(esAdmin ? { estado: filtroEstado } : {}),
  }), [nombreInstAplicado, filtrosInst, rangoInstValido, puedeFiltrarPorEmpleado, esAdmin, filtroEstado]);

  // ── Polling inteligente de vectorización RAG ──────────────────────────────
  const { iniciarPolling } = useRagIndexingPolling();

  const handleDocumentoSubido = (
    doc: DocumentoRespuestaDto,
    esIndexable: boolean,
  ) => {
    if (esIndexable) {
      iniciarPolling(doc);
    } else {
      toast.success("Archivo guardado exitosamente.");
    }
  };

  const bajaMutation = useBajaDocumento();
  const reactivarDocMutation = useReactivarDocumento();

  const applySearchInst = () => {
    setNombreInstAplicado(filtrosInst.nombre.trim());
  };

  const clearFiltrosInst = () => {
    setFiltrosInst(FILTROS_VACIOS);
    setNombreInstAplicado("");
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

  const handleConfirmarReactivarDoc = async () => {
    if (!reactivarDoc) return;
    try {
      await reactivarDocMutation.mutateAsync(reactivarDoc.idDocumento);
      toast.success(`"${reactivarDoc.nombreDocumento}" reactivado exitosamente.`);
      setReactivarDoc(null);
    } catch (error) {
      toast.error(
        normalizeApiError(error, "No se pudo reactivar el documento.").message,
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
      <Tabs defaultValue={isOperario ? "mis-documentos" : "institucionales"}>
        <TabsList>
          {isOperario && (
            <TabsTrigger value="mis-documentos">
              Mis Documentos
            </TabsTrigger>
          )}
          <TabsTrigger value="institucionales">
            Documentos Institucionales
          </TabsTrigger>
          {esAdmin && (
            <TabsTrigger value="tipos">Administrar Tipos</TabsTrigger>
          )}
        </TabsList>

        {/* ══ Tab: Mis Documentos (Solo ROLE_OPERARIO) ══ */}
        {isOperario && (
          <TabsContent value="mis-documentos">
            <div className="space-y-4">
              {/* Acciones del tab (disponible para todos los roles) */}
              <div className="flex justify-end">
                <Button onClick={() => setUploadOpen(true)}>
                  <FileUp />
                  Subir documento
                </Button>
              </div>

              {/* Filtros: buscador, tipo y rango de fechas */}
              <DocumentosFiltros
                idPrefix="mis-docs"
                placeholder="Buscar en mis documentos..."
                valores={filtrosMisDocs}
                onChange={setFiltrosMisDocs}
                onLimpiar={() => setFiltrosMisDocs(FILTROS_VACIOS)}
              />

              {/* Tabla de mis documentos */}
              <Card className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                  <FolderArchive className="size-5 text-primary" />
                  <h2 className="font-semibold">Mis Documentos</h2>
                  {hayFiltrosActivos(filtrosMisDocs) ? (
                    <Badge variant="neutral" className="ml-auto text-xs">
                      Filtrado
                    </Badge>
                  ) : null}
                </div>

                <MiDocumentacionTable
                  searchTerm={filtrosMisDocs.nombre}
                  tipoDocumentoNombre={tipoMisDocsNombre}
                  fechaDesde={rangoMisDocsValido ? filtrosMisDocs.fechaDesde : undefined}
                  fechaHasta={rangoMisDocsValido ? filtrosMisDocs.fechaHasta : undefined}
                  onPrevisualizar={handlePrevisualizar}
                  onBaja={setBajaDoc}
                />
              </Card>
            </div>
          </TabsContent>
        )}

        {/* ══ Tab: Documentos Institucionales ══ */}
        <TabsContent value="institucionales">
          <div className="space-y-4">
            {/* Acciones del tab y filtros de estado */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {esAdmin ? (
                <div className="flex w-full sm:w-auto items-center gap-1 rounded-lg border border-border bg-muted p-1">
                  {TABS_ESTADO.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setFiltroEstado(tab.value)}
                      className={cn(
                        "flex-1 sm:flex-initial flex h-8 items-center justify-center gap-1.5 rounded-control px-3 text-xs font-semibold transition-all cursor-pointer",
                        filtroEstado === tab.value
                          ? "bg-card text-primary shadow-soft"
                          : "text-foreground-muted hover:text-foreground",
                      )}
                    >
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              ) : <div />}

              <Button onClick={() => setUploadOpen(true)}>
                <FileUp />
                Subir documento
              </Button>
            </div>

            {/* Filtros: buscador, tipo, rango de fechas y (ADMIN / RRHH) empleado */}
            <DocumentosFiltros
              idPrefix="institucionales"
              placeholder="Buscar por nombre de documento..."
              valores={filtrosInst}
              onChange={setFiltrosInst}
              onBuscar={applySearchInst}
              onLimpiar={clearFiltrosInst}
              mostrarEmpleado={puedeFiltrarPorEmpleado}
            />

            {/* Tabla de documentos institucionales */}
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Files className="size-5 text-primary" />
                <h2 className="font-semibold">Documentos Institucionales</h2>
                {(Object.keys(appliedFilters).some((k) => k !== "estado") || (esAdmin && filtroEstado !== "ACTIVOS")) ? (
                  <Badge variant="neutral" className="ml-auto text-xs">
                    Filtrado
                  </Badge>
                ) : null}
              </div>

              <DocumentosTable
                filters={appliedFilters}
                onPrevisualizar={handlePrevisualizar}
                onBaja={setBajaDoc}
                onReactivar={setReactivarDoc}
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
          <UploadDocumentoForm
            onSuccess={() => setUploadOpen(false)}
            onDocumentoSubido={handleDocumentoSubido}
          />
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

      {/* Dialog: Confirmar reactivación de documento */}
      <Dialog
        open={Boolean(reactivarDoc)}
        onOpenChange={(o) => {
          if (!o) setReactivarDoc(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivar documento</DialogTitle>
            <DialogDescription>
              ¿Confirmás que querés reactivar el documento{" "}
              <strong className="text-foreground">
                {reactivarDoc?.nombreDocumento}
              </strong>
              ? Volverá a estar disponible en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            ⚠ Si el documento se usaba con el asistente de IA, después de reactivarlo vas a poder indexarlo de nuevo con el botón &apos;Indexar para la IA&apos;. No se reindexa automáticamente.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setReactivarDoc(null)}
              disabled={reactivarDocMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmarReactivarDoc}
              disabled={reactivarDocMutation.isPending}
            >
              {reactivarDocMutation.isPending ? "Reactivando..." : "Confirmar reactivación"}
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
