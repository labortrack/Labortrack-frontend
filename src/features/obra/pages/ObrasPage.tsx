import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Search, Settings2, X } from "lucide-react";
import { ObraCard } from "../components/ObraCard";
import {
  CloseObraDialog,
  CreateObraDialog,
  EditObraDialog,
} from "../components/ObraDialogs";
import { EstadoBadge } from "../estado/components/EstadoBadge";
import type { Capataz, Obra } from "../types/obra.types";
import { Button, Card, Input } from "@/shared/ui";

const CAPATACES_MOCK: Capataz[] = [
  { id: 1, nombre: "Eduardo Pérez", estado: "activo" },
  { id: 2, nombre: "Marcelo Giménez", estado: "activo" },
  { id: 3, nombre: "Sofía Leguizamón", estado: "activo" },
  { id: 4, nombre: "Fernando Ríos", estado: "activo" },
  { id: 5, nombre: "Natalia Carrasco", estado: "activo" },
  { id: 6, nombre: "Diego Villanueva", estado: "suspendido" },
];

const OBRAS_INICIALES: Obra[] = [
  {
    id: 1,
    nombre: "Torre Mendoza Centro",
    nomenclatura: "NOM-2026-04",
    pais: "Argentina",
    provincia: "Mendoza",
    localidad: "Ciudad de Mendoza",
    capatazId: 1,
    capatazNombre: "Eduardo Pérez",
    estado: "PLANIFICADA",
    tieneCuadrillasActivas: false,
  },
  {
    id: 2,
    nombre: "Residencial San Telmo",
    nomenclatura: "NOM-2025-11",
    pais: "Argentina",
    provincia: "Buenos Aires",
    localidad: "CABA",
    capatazId: 2,
    capatazNombre: "Marcelo Giménez",
    estado: "EN EJECUCIÓN",
    tieneCuadrillasActivas: true,
  },
  {
    id: 3,
    nombre: "Complejo Industrial GBA",
    nomenclatura: "NOM-2025-08",
    pais: "Argentina",
    provincia: "Buenos Aires",
    localidad: "Quilmes",
    capatazId: 3,
    capatazNombre: "Sofía Leguizamón",
    estado: "EN FUNDACIÓN",
    tieneCuadrillasActivas: true,
  },
  {
    id: 4,
    nombre: "Centro Logístico Córdoba",
    nomenclatura: "NOM-2026-01",
    pais: "Argentina",
    provincia: "Córdoba",
    localidad: "Ciudad de Córdoba",
    capatazId: 4,
    capatazNombre: "Fernando Ríos",
    estado: "EN EJECUCIÓN",
    tieneCuadrillasActivas: true,
  },
  {
    id: 5,
    nombre: "Hospital Zonal Rosario",
    nomenclatura: "NOM-2024-17",
    pais: "Argentina",
    provincia: "Santa Fe",
    localidad: "Rosario",
    capatazId: 5,
    capatazNombre: "Natalia Carrasco",
    estado: "SUSPENDIDA",
    tieneCuadrillasActivas: false,
  },
  {
    id: 6,
    nombre: "Puente Ruta Nacional 7",
    nomenclatura: "NOM-2024-09",
    pais: "Argentina",
    provincia: "Mendoza",
    localidad: "Luján de Cuyo",
    capatazId: 2,
    capatazNombre: "Marcelo Giménez",
    estado: "EN INSPECCIÓN",
    tieneCuadrillasActivas: false,
  },
  {
    id: 7,
    nombre: "Parque Fotovoltaico Sur",
    nomenclatura: "NOM-2023-22",
    pais: "Argentina",
    provincia: "San Juan",
    localidad: "Caucete",
    capatazId: 4,
    capatazNombre: "Fernando Ríos",
    estado: "FINALIZADA",
    tieneCuadrillasActivas: false,
  },
  {
    id: 8,
    nombre: "Edificio Oficinas Palermo",
    nomenclatura: "NOM-2026-03",
    pais: "Argentina",
    provincia: "Buenos Aires",
    localidad: "CABA",
    capatazId: 1,
    capatazNombre: "Eduardo Pérez",
    estado: "PLANIFICADA",
    tieneCuadrillasActivas: false,
  },
  {
    id: 9,
    nombre: "Planta Tratamiento Tucumán",
    nomenclatura: "NOM-2025-14",
    pais: "Argentina",
    provincia: "Tucumán",
    localidad: "San Miguel de Tucumán",
    capatazId: 3,
    capatazNombre: "Sofía Leguizamón",
    estado: "EN EJECUCIÓN",
    tieneCuadrillasActivas: true,
  },
];

export default function ObrasPage() {
  const navigate = useNavigate();
  const [obras, setObras] = useState<Obra[]>(OBRAS_INICIALES);
  const [busqueda, setBusqueda] = useState("");

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [closingObra, setClosingObra] = useState<Obra | null>(null);

  const obrasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return obras;
    return obras.filter(
      (o) =>
        o.nombre.toLowerCase().includes(q) ||
        o.localidad.toLowerCase().includes(q) ||
        o.provincia.toLowerCase().includes(q) ||
        o.capatazNombre.toLowerCase().includes(q) ||
        o.nomenclatura.toLowerCase().includes(q),
    );
  }, [obras, busqueda]);

  const handleCrearObra = (nueva: Obra) => {
    setObras((prev) => [nueva, ...prev]);
  };

  const handleModificarObra = (actualizada: Obra) => {
    setObras((prev) =>
      prev.map((o) => (o.id === actualizada.id ? actualizada : o)),
    );
  };

  const handleConfirmarCierre = (idObra: number) => {
    setObras((prev) =>
      prev.map((o) => (o.id === idObra ? { ...o, estado: "ARCHIVADA" } : o)),
    );
  };

  const highlightedStates = ["EN EJECUCIÓN", "EN FUNDACIÓN", "PLANIFICADA"];

  return (
    <div className="space-y-6">
      {/* ── Module Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Building2 className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-medium leading-7 text-foreground">
              Obras y Frentes de Trabajo
            </h1>
            <p className="mt-0.5 text-sm text-foreground-muted">
              Control logístico, centros de costos y asignación de capataces responsables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/configuracion-obras")}
          >
            <Settings2 className="mr-1.5 size-4" />
            Configuración de Estados
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Nueva Obra
          </Button>
        </div>
      </div>

      {/* ── Search toolbar ────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar obras por nombre, localidad o capataz..."
          className="pl-10 h-11 bg-card shadow-soft text-sm"
        />
        {busqueda ? (
          <button
            type="button"
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full text-foreground-muted hover:bg-subtle"
            aria-label="Limpiar búsqueda"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* ── Results summary ───────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-medium text-foreground-muted">
          {obrasFiltradas.length} obra{obrasFiltradas.length !== 1 ? "s" : ""}
          {busqueda ? <span className="ml-1">— filtrando por "{busqueda}"</span> : null}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {highlightedStates.map((estadoNombre) => {
            const count = obras.filter((o) => o.estado === estadoNombre).length;
            if (!count) return null;
            return (
              <span
                key={estadoNombre}
                className="inline-flex items-center gap-1.5 rounded-full bg-subtle px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <span className="font-bold">{count}</span>
                <EstadoBadge estado={estadoNombre} className="py-0 px-1 text-[11px]" />
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Cards Grid ────────────────────────────────────────────── */}
      {obrasFiltradas.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-subtle text-foreground-muted mb-3">
            <Building2 className="size-7" />
          </div>
          <p className="font-semibold text-foreground mb-1">
            No se encontraron obras
          </p>
          <p className="text-xs text-foreground-muted">
            Intente con otro término de búsqueda o registre una nueva obra.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {obrasFiltradas.map((obra) => (
            <ObraCard
              key={obra.id}
              obra={obra}
              onEdit={setEditingObra}
              onClose={setClosingObra}
              onDetalle={(o) => navigate(`/obras/${o.id}`)}
            />
          ))}
        </div>
      )}

      {/* ── Modales ────────────────────────────────────────────── */}
      <CreateObraDialog
        open={createOpen}
        capataces={CAPATACES_MOCK}
        onOpenChange={setCreateOpen}
        onSuccess={handleCrearObra}
        nextId={Math.max(...obras.map((o) => o.id), 0) + 1}
      />

      <EditObraDialog
        key={editingObra?.id ?? "edit-obra"}
        obra={editingObra}
        capataces={CAPATACES_MOCK}
        onOpenChange={(open) => {
          if (!open) setEditingObra(null);
        }}
        onSuccess={handleModificarObra}
      />

      <CloseObraDialog
        key={closingObra?.id ?? "close-obra"}
        obra={closingObra}
        onOpenChange={(open) => {
          if (!open) setClosingObra(null);
        }}
        onConfirm={handleConfirmarCierre}
      />
    </div>
  );
}
