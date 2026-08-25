import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  HardHat,
  Lock,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { EstadoBadge } from "../estado/components/EstadoBadge";
import { CapatazAvatar } from "./CapatazAvatar";
import type { Capataz, Obra, ObraFormData } from "../types/obra.types";
import { FormField } from "@/shared/components";
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";

const FORM_INIT: ObraFormData = {
  nombre: "",
  nomenclatura: "",
  pais: "Argentina",
  provincia: "",
  localidad: "",
  capatazId: "",
};

// ─── Modal 1: Registrar Obra ────────────────────────────────────────────────

interface CreateObraDialogProps {
  open: boolean;
  capataces: Capataz[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (nuevaObra: Obra) => void;
  nextId: number;
}

export function CreateObraDialog({
  open,
  capataces,
  onOpenChange,
  onSuccess,
  nextId,
}: CreateObraDialogProps) {
  const [form, setForm] = useState<ObraFormData>({ ...FORM_INIT });
  const [errores, setErrores] = useState<Partial<Record<keyof ObraFormData, string>>>({});
  const [showCapatazWarning, setShowCapatazWarning] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setForm({ ...FORM_INIT });
      setErrores({});
      setShowCapatazWarning(false);
    }
    onOpenChange(nextOpen);
  };

  const setField = (key: keyof ObraFormData, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errores[key]) setErrores((p) => ({ ...p, [key]: undefined }));
    setShowCapatazWarning(false);
  };

  const validar = () => {
    const e: Partial<Record<keyof ObraFormData, string>> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre de la obra es obligatorio.";
    if (!form.nomenclatura.trim())
      e.nomenclatura = "La nomenclatura contractual es obligatoria.";
    if (!form.provincia.trim()) e.provincia = "La provincia es obligatoria.";
    if (!form.localidad.trim()) e.localidad = "La localidad es obligatoria.";
    if (!form.capatazId) e.capatazId = "Debe asignar un capataz responsable.";
    return e;
  };

  const handleGuardar = () => {
    const errs = validar();
    if (Object.keys(errs).length) {
      setErrores(errs);
      return;
    }

    const cap = capataces.find((c) => String(c.id) === form.capatazId);
    if (cap?.estado === "suspendido") {
      setShowCapatazWarning(true);
      return;
    }

    const nueva: Obra = {
      id: nextId,
      nombre: form.nombre.trim(),
      nomenclatura: form.nomenclatura.trim().toUpperCase(),
      pais: form.pais.trim() || "Argentina",
      provincia: form.provincia.trim(),
      localidad: form.localidad.trim(),
      capatazId: parseInt(form.capatazId, 10),
      capatazNombre: cap?.nombre ?? "—",
      estado: "PLANIFICADA",
      tieneCuadrillasActivas: false,
    };

    onSuccess(nueva);
    toast.success("Frente de trabajo registrado correctamente.", {
      description: `"${nueva.nombre}" ha sido dado de alta con estado PLANIFICADA.`,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Building2 className="size-5" />
            </span>
            <div>
              <DialogTitle>Registrar Nuevo Frente de Trabajo</DialogTitle>
              <DialogDescription>
                Complete los datos del proyecto. El estado inicial será{" "}
                <strong className="text-primary font-bold">PLANIFICADA</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <FormField
            id="obra-nombre"
            label="Nombre de la Obra"
            error={errores.nombre}
            required
          >
            <Input
              id="obra-nombre"
              placeholder="Ej: Torre Mendoza Centro"
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              aria-invalid={Boolean(errores.nombre)}
            />
          </FormField>

          <FormField
            id="obra-nomenclatura"
            label="Nomenclatura Contractual"
            error={errores.nomenclatura}
            required
          >
            <Input
              id="obra-nomenclatura"
              placeholder="Ej: NOM-2026-04"
              value={form.nomenclatura}
              onChange={(e) => setField("nomenclatura", e.target.value)}
              aria-invalid={Boolean(errores.nomenclatura)}
            />
          </FormField>

          <div>
            <span className="mb-2 block text-xs font-semibold text-primary">
              Ubicación Geográfica
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField id="obra-pais" label="País" required>
                <Input
                  id="obra-pais"
                  placeholder="Argentina"
                  value={form.pais}
                  onChange={(e) => setField("pais", e.target.value)}
                />
              </FormField>

              <FormField
                id="obra-provincia"
                label="Provincia"
                error={errores.provincia}
                required
              >
                <Input
                  id="obra-provincia"
                  placeholder="Ej: Mendoza"
                  value={form.provincia}
                  onChange={(e) => setField("provincia", e.target.value)}
                  aria-invalid={Boolean(errores.provincia)}
                />
              </FormField>

              <FormField
                id="obra-localidad"
                label="Localidad"
                error={errores.localidad}
                required
              >
                <Input
                  id="obra-localidad"
                  placeholder="Ej: Ciudad de Mendoza"
                  value={form.localidad}
                  onChange={(e) => setField("localidad", e.target.value)}
                  aria-invalid={Boolean(errores.localidad)}
                />
              </FormField>
            </div>
          </div>

          <FormField
            id="obra-capataz"
            label="Asignar Capataz Responsable"
            error={errores.capatazId}
            required
          >
            <Select
              value={form.capatazId}
              onValueChange={(v) => setField("capatazId", v)}
            >
              <SelectTrigger id="obra-capataz" aria-invalid={Boolean(errores.capatazId)}>
                <SelectValue placeholder="Buscar y seleccionar capataz..." />
              </SelectTrigger>
              <SelectContent>
                {capataces.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <div className="flex items-center gap-2">
                      <CapatazAvatar nombre={c.nombre} size="sm" />
                      <span>{c.nombre}</span>
                      {c.estado === "suspendido" ? (
                        <span className="text-[11px] font-bold text-error">
                          (SUSPENDIDO)
                        </span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {showCapatazWarning ? (
            <Alert variant="error" className="flex items-start gap-3">
              <XCircle className="size-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Asignación bloqueada</strong>
                <p className="text-xs">
                  No se puede confirmar la operación. El Capataz seleccionado se
                  encuentra suspendido o no está habilitado para tomar nuevas obras.
                </p>
              </div>
            </Alert>
          ) : null}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-subtle">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleGuardar}>
            <HardHat className="mr-1.5 size-4" />
            Confirmar Obra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal 2: Modificar Obra ────────────────────────────────────────────────

interface EditObraDialogProps {
  obra: Obra | null;
  capataces: Capataz[];
  onOpenChange: (open: boolean) => void;
  onSuccess: (obraActualizada: Obra) => void;
}

export function EditObraDialog({
  obra,
  capataces,
  onOpenChange,
  onSuccess,
}: EditObraDialogProps) {
  const [form, setForm] = useState<ObraFormData>(() => ({
    nombre: obra?.nombre ?? "",
    nomenclatura: obra?.nomenclatura ?? "",
    pais: obra?.pais ?? "Argentina",
    provincia: obra?.provincia ?? "",
    localidad: obra?.localidad ?? "",
    capatazId: obra ? String(obra.capatazId) : "",
  }));
  const [errores, setErrores] = useState<Partial<Record<keyof ObraFormData, string>>>({});

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setErrores({});
    }
    onOpenChange(nextOpen);
  };

  const setField = (key: keyof ObraFormData, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errores[key]) setErrores((p) => ({ ...p, [key]: undefined }));
  };

  const handleGuardarCambios = () => {
    if (!obra) return;
    const e: Partial<Record<keyof ObraFormData, string>> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre de la obra es obligatorio.";
    if (!form.provincia.trim()) e.provincia = "La provincia es obligatoria.";
    if (!form.localidad.trim()) e.localidad = "La localidad es obligatoria.";
    if (!form.capatazId) e.capatazId = "Debe asignar un capataz responsable.";

    if (Object.keys(e).length) {
      setErrores(e);
      return;
    }

    const cap = capataces.find((c) => String(c.id) === form.capatazId);
    const updated: Obra = {
      ...obra,
      nombre: form.nombre.trim(),
      pais: form.pais.trim(),
      provincia: form.provincia.trim(),
      localidad: form.localidad.trim(),
      capatazId: parseInt(form.capatazId, 10),
      capatazNombre: cap?.nombre ?? obra.capatazNombre,
    };

    onSuccess(updated);
    toast.success("Frente de trabajo actualizado correctamente.");
    handleOpenChange(false);
  };

  return (
    <Dialog open={Boolean(obra)} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-border bg-card">
          <DialogTitle>Modificar Frente de Trabajo</DialogTitle>
          <DialogDescription>
            La nomenclatura contractual no puede modificarse una vez registrada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <FormField
            id="edit-obra-nombre"
            label="Nombre de la Obra"
            error={errores.nombre}
            required
          >
            <Input
              id="edit-obra-nombre"
              value={form.nombre}
              onChange={(e) => setField("nombre", e.target.value)}
              aria-invalid={Boolean(errores.nombre)}
            />
          </FormField>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nomenclatura Contractual
            </label>
            <div className="relative">
              <Input
                value={form.nomenclatura}
                disabled
                className="cursor-not-allowed bg-subtle text-foreground-muted pr-8"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-foreground-muted" />
            </div>
            <p className="text-[11px] text-foreground-muted">
              Campo inmutable para garantizar la trazabilidad contractual.
            </p>
          </div>

          <div>
            <span className="mb-2 block text-xs font-semibold text-primary">
              Ubicación Geográfica
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField id="edit-obra-pais" label="País" required>
                <Input
                  id="edit-obra-pais"
                  value={form.pais}
                  onChange={(e) => setField("pais", e.target.value)}
                />
              </FormField>

              <FormField
                id="edit-obra-provincia"
                label="Provincia"
                error={errores.provincia}
                required
              >
                <Input
                  id="edit-obra-provincia"
                  value={form.provincia}
                  onChange={(e) => setField("provincia", e.target.value)}
                  aria-invalid={Boolean(errores.provincia)}
                />
              </FormField>

              <FormField
                id="edit-obra-localidad"
                label="Localidad"
                error={errores.localidad}
                required
              >
                <Input
                  id="edit-obra-localidad"
                  value={form.localidad}
                  onChange={(e) => setField("localidad", e.target.value)}
                  aria-invalid={Boolean(errores.localidad)}
                />
              </FormField>
            </div>
          </div>

          <FormField
            id="edit-obra-capataz"
            label="Capataz Responsable"
            error={errores.capatazId}
            required
          >
            <Select
              value={form.capatazId}
              onValueChange={(v) => setField("capatazId", v)}
            >
              <SelectTrigger id="edit-obra-capataz">
                <SelectValue placeholder="Seleccionar capataz..." />
              </SelectTrigger>
              <SelectContent>
                {capataces.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <div className="flex items-center gap-2">
                      <CapatazAvatar nombre={c.nombre} size="sm" />
                      <span>{c.nombre}</span>
                      {c.estado === "suspendido" ? (
                        <span className="text-[11px] font-bold text-error">
                          (SUSPENDIDO)
                        </span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-subtle">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleGuardarCambios}>
            <CheckCircle2 className="mr-1.5 size-4" />
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modal 3: Cierre Administrativo ─────────────────────────────────────────

interface CloseObraDialogProps {
  obra: Obra | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (obraId: number) => void;
}

export function CloseObraDialog({
  obra,
  onOpenChange,
  onConfirm,
}: CloseObraDialogProps) {
  const tieneCuadrillas = obra?.tieneCuadrillasActivas ?? false;

  const handleConfirmar = () => {
    if (!obra || tieneCuadrillas) return;
    onConfirm(obra.id);
    toast.success("Frente de trabajo archivado.", {
      description: "La obra ha sido cerrada administrativamente.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={Boolean(obra)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${
                tieneCuadrillas
                  ? "bg-error-soft text-error"
                  : "bg-warning-soft text-warning"
              }`}
            >
              {tieneCuadrillas ? (
                <XCircle className="size-6 text-error" />
              ) : (
                <AlertTriangle className="size-6 text-warning" />
              )}
            </div>
            <div>
              <DialogTitle>Cierre Administrativo de Obra</DialogTitle>
              {obra ? (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded bg-subtle px-2 py-0.5 text-xs text-foreground">
                    <Building2 className="size-3 text-foreground-muted" />
                    <span>{obra.nombre}</span>
                  </span>
                  <EstadoBadge estado={obra.estado} />
                </div>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <DialogDescription className="text-sm leading-relaxed text-foreground-muted">
            ¿Está seguro de que desea finalizar este frente de trabajo? Se aplicará
            una baja lógica y se transicionará el proyecto al estado{" "}
            <strong className="font-bold text-foreground">ARCHIVADA</strong>.
          </DialogDescription>

          {tieneCuadrillas ? (
            <Alert variant="error" className="flex items-start gap-3">
              <XCircle className="size-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="block font-bold mb-0.5">
                  Cierre bloqueado — cuadrillas activas
                </strong>
                <p>
                  Imposible finalizar el frente de trabajo: Existen cuadrillas de
                  construcción operando en el terreno. Debe transicionar todas las
                  cuadrillas asociadas al estado FINALIZADA o SUSPENDIDA antes de
                  proceder al cierre.
                </p>
              </div>
            </Alert>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning-soft/40 p-3 text-xs text-foreground-muted">
              <AlertTriangle className="size-4 shrink-0 text-warning mt-0.5" />
              <span>
                Esta acción es irreversible. El historial del proyecto y sus
                registros operativos se conservarán para auditoría.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmar}
            disabled={tieneCuadrillas}
            className={tieneCuadrillas ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Trash2 className="mr-1.5 size-4" />
            Confirmar Cierre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
