import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui";
import {
  Layers,
  Link2,
  Plus,
  ArrowLeft,
  UserCheck,
  UserX,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { KpiSummaryCard } from "../components/KpiSummaryCard";
import { GruposTable } from "../components/GruposTable";
import { AsignacionesTable } from "../components/AsignacionesTable";
import { NuevoGrupoDialog } from "../components/dialogs/NuevoGrupoDialog";
import { ModificarGrupoDialog } from "../components/dialogs/ModificarGrupoDialog";
import { BajaGrupoDialog } from "../components/dialogs/BajaGrupoDialog";
import { NuevaAsignacionDialog } from "../components/dialogs/NuevaAsignacionDialog";
import { FinalizarAsignacionDialog } from "../components/dialogs/FinalizarAsignacionDialog";
import {
  useGruposList,
  useCreateGrupo,
  useUpdateGrupo,
  useDeleteGrupo,
  useEmpleadoGruposList,
  useCreateEmpleadoGrupo,
  useFinalizarEmpleadoGrupo,
  useEmpleadosActivos,
} from "../hooks/useEstructuraLaboral";
import type {
  GrupoResponseDto,
  EmpleadoGrupoResponseDto,
  MainTab,
  TabFiltroGrupo,
} from "../types/estructuraLaboral.types";

export default function EstructuraLaboralPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MainTab>("grupos");

  // ── Queries & Mutations (Direct Backend Data) ──
  const gruposQuery = useGruposList();
  const empleadoGruposQuery = useEmpleadoGruposList();
  const empleadosActivosQuery = useEmpleadosActivos();

  const createGrupoMutation = useCreateGrupo();
  const updateGrupoMutation = useUpdateGrupo();
  const deleteGrupoMutation = useDeleteGrupo();
  const createEmpleadoGrupoMutation = useCreateEmpleadoGrupo();
  const finalizarEmpleadoGrupoMutation = useFinalizarEmpleadoGrupo();

  const grupos = useMemo(
    () => gruposQuery.data?.content ?? [],
    [gruposQuery.data]
  );
  const asignaciones = useMemo(
    () => empleadoGruposQuery.data?.content ?? [],
    [empleadoGruposQuery.data]
  );
  const empleadosActivos = useMemo(
    () => empleadosActivosQuery.data?.content ?? [],
    [empleadosActivosQuery.data]
  );

  // Map of active employees count per group
  const vinculadosMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const a of asignaciones) {
      if (!a.fechaHastaEmpleadoGrupo) {
        map[a.grupoId] = (map[a.grupoId] ?? 0) + 1;
      }
    }
    return map;
  }, [asignaciones]);

  // ── Grupos State ──
  const [filtroGrupo, setFiltroGrupo] = useState<TabFiltroGrupo>("Activos");
  const [modalNuevoGrupoOpen, setModalNuevoGrupoOpen] = useState(false);
  const [editTargetGrupo, setEditTargetGrupo] =
    useState<GrupoResponseDto | null>(null);
  const [deleteTargetGrupo, setDeleteTargetGrupo] =
    useState<GrupoResponseDto | null>(null);

  // ── Asignaciones State ──
  const [busquedaAsig, setBusquedaAsig] = useState("");
  const [filtroGrupoAsig, setFiltroGrupoAsig] = useState("all");
  const [filtroEstadoAsig, setFiltroEstadoAsig] = useState("vigentes");
  const [modalNuevaAsigOpen, setModalNuevaAsigOpen] = useState(false);
  const [finalizarTargetAsig, setFinalizarTargetAsig] =
    useState<EmpleadoGrupoResponseDto | null>(null);

  // Derived counts for Asignaciones
  const totalVinc = asignaciones.length;
  const totalVig = asignaciones.filter((a) => !a.fechaHastaEmpleadoGrupo).length;
  const totalHist = asignaciones.filter((a) => !!a.fechaHastaEmpleadoGrupo).length;

  // ── Handlers ──
  const handleGuardarNuevoGrupo = async (denom: string) => {
    await createGrupoMutation.mutateAsync({ tipoActividad: denom });
    toast.success("Grupo de empleados creado correctamente.", {
      description: `"${denom}" agregado a la estructura laboral.`,
    });
  };

  const handleActualizarGrupo = async (id: number, denom: string) => {
    await updateGrupoMutation.mutateAsync({
      id,
      payload: { tipoActividad: denom },
    });
    toast.success("Grupo actualizado correctamente.");
  };

  const handleConfirmarBajaGrupo = async (id: number) => {
    await deleteGrupoMutation.mutateAsync(id);
    toast.success("Grupo dado de baja.");
  };

  const handleGuardarAsignacion = async (
    empleadoId: number,
    grupoId: number
  ) => {
    await createEmpleadoGrupoMutation.mutateAsync({
      idEmpleado: empleadoId,
      idGrupo: grupoId,
    });
    toast.success("Asignación registrada correctamente.");
  };

  const handleConfirmarFinalizarAsig = async (
    asig: EmpleadoGrupoResponseDto
  ) => {
    await finalizarEmpleadoGrupoMutation.mutateAsync(asig.id);
    toast.success("Asignación finalizada correctamente.");
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <button
          onClick={() => navigate("/legajos")}
          className="flex items-center gap-1.5 text-foreground-muted hover:text-primary transition-colors group mb-3 cursor-pointer"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-[13px] font-medium">Atrás</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#e8f0ff] rounded-[0.5rem] flex items-center justify-center shrink-0">
            <Layers className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold leading-7 text-foreground mb-0.5 tracking-tight">
              Estructura Laboral – Grupos de Empleados
            </h1>
            <p className="text-[13px] text-foreground-muted">
              Gestión de especialidades técnico-operativas y ramas operativas de
              la empresa
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab Bar + CTA ── */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-0">
          <button
            onClick={() => setActiveTab("grupos")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[14px] font-semibold transition-all -mb-px cursor-pointer ${
              activeTab === "grupos"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground hover:border-[#d4d4d4]"
            }`}
          >
            <Layers className="size-4" />
            Grupos de Empleados
          </button>

          <button
            onClick={() => setActiveTab("asignaciones")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-[14px] font-semibold transition-all -mb-px cursor-pointer ${
              activeTab === "asignaciones"
                ? "border-primary text-primary"
                : "border-transparent text-foreground-muted hover:text-foreground hover:border-[#d4d4d4]"
            }`}
          >
            <Link2 className="size-4" />
            Asignación de Empleados
            {totalVig > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                  activeTab === "asignaciones"
                    ? "bg-[#e8f0ff] text-primary"
                    : "bg-[#f0f0f0] text-foreground-muted"
                }`}
              >
                {totalVig}
              </span>
            )}
          </button>
        </div>

        {activeTab === "grupos" ? (
          <Button
            onClick={() => setModalNuevoGrupoOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-[0.25rem] h-9 px-4 shadow-soft mb-2"
          >
            <Plus className="size-4" />
            <span className="text-[13px] font-bold text-white">
              Nuevo Grupo de Empleados
            </span>
          </Button>
        ) : (
          <Button
            onClick={() => setModalNuevaAsigOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-[0.25rem] h-9 px-4 shadow-soft mb-2"
          >
            <Plus className="size-4" />
            <span className="text-[13px] font-bold text-white">
              Asignar Empleado a Grupo
            </span>
          </Button>
        )}
      </div>

      {/* ── Tab 1: Grupos ── */}
      {activeTab === "grupos" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <KpiSummaryCard
              icon={<Layers className="size-5" />}
              iconBg="bg-[#e8f0ff]"
              iconColor="text-primary"
              label="TOTAL GRUPOS"
              value={grupos.length}
            />
            <KpiSummaryCard
              icon={<UserCheck className="size-5" />}
              iconBg="bg-success-soft"
              iconColor="text-success"
              label="ACTIVOS"
              value={grupos.filter((g) => g.activo).length}
              valueColor="#004c28"
            />
            <KpiSummaryCard
              icon={<UserX className="size-5" />}
              iconBg="bg-[#fdf0eb]"
              iconColor="text-accent-deep"
              label="INACTIVOS"
              value={grupos.filter((g) => !g.activo).length}
              valueColor="#e0672a"
            />
          </div>

          <GruposTable
            grupos={grupos}
            vinculadosMap={vinculadosMap}
            filtroGrupo={filtroGrupo}
            onFiltroChange={setFiltroGrupo}
            onEdit={(g) => setEditTargetGrupo(g)}
            onDelete={(g) => setDeleteTargetGrupo(g)}
            isLoading={gruposQuery.isLoading}
          />
        </div>
      )}

      {/* ── Tab 2: Asignaciones ── */}
      {activeTab === "asignaciones" && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <KpiSummaryCard
              icon={<Link2 className="size-5" />}
              iconBg="bg-[#e8f0ff]"
              iconColor="text-primary"
              label="TOTAL VINCULACIONES"
              value={totalVinc}
            />
            <KpiSummaryCard
              icon={<UserCheck className="size-5" />}
              iconBg="bg-success-soft"
              iconColor="text-success"
              label="VIGENTES"
              value={totalVig}
              valueColor="#004c28"
            />
            <KpiSummaryCard
              icon={<History className="size-5" />}
              iconBg="bg-[#f5f0ff]"
              iconColor="text-[#7c3aed]"
              label="HISTÓRICAS"
              value={totalHist}
              valueColor="#7c3aed"
            />
          </div>

          <AsignacionesTable
            asignaciones={asignaciones}
            grupos={grupos}
            busqueda={busquedaAsig}
            onBusquedaChange={setBusquedaAsig}
            filtroGrupo={filtroGrupoAsig}
            onFiltroGrupoChange={setFiltroGrupoAsig}
            filtroEstado={filtroEstadoAsig}
            onFiltroEstadoChange={setFiltroEstadoAsig}
            onFinalizar={(a) => setFinalizarTargetAsig(a)}
            isLoading={empleadoGruposQuery.isLoading}
          />
        </div>
      )}

      {/* ── Dialogs ── */}
      <NuevoGrupoDialog
        open={modalNuevoGrupoOpen}
        onOpenChange={setModalNuevoGrupoOpen}
        onGuardar={handleGuardarNuevoGrupo}
        gruposExistentes={grupos}
        isPending={createGrupoMutation.isPending}
      />

      <ModificarGrupoDialog
        grupo={editTargetGrupo}
        empleadosVinculados={
          editTargetGrupo ? vinculadosMap[editTargetGrupo.id] ?? 0 : 0
        }
        open={editTargetGrupo !== null}
        onOpenChange={(o) => (!o ? setEditTargetGrupo(null) : null)}
        onActualizar={handleActualizarGrupo}
        gruposExistentes={grupos}
        isPending={updateGrupoMutation.isPending}
      />

      <BajaGrupoDialog
        grupo={deleteTargetGrupo}
        empleadosVinculados={
          deleteTargetGrupo ? vinculadosMap[deleteTargetGrupo.id] ?? 0 : 0
        }
        open={deleteTargetGrupo !== null}
        onOpenChange={(o) => (!o ? setDeleteTargetGrupo(null) : null)}
        onConfirmarBaja={handleConfirmarBajaGrupo}
        isPending={deleteGrupoMutation.isPending}
      />

      <NuevaAsignacionDialog
        open={modalNuevaAsigOpen}
        onOpenChange={setModalNuevaAsigOpen}
        onAsignar={handleGuardarAsignacion}
        grupos={grupos}
        empleados={empleadosActivos}
        isPending={createEmpleadoGrupoMutation.isPending}
      />

      <FinalizarAsignacionDialog
        asig={finalizarTargetAsig}
        open={finalizarTargetAsig !== null}
        onOpenChange={(o) => (!o ? setFinalizarTargetAsig(null) : null)}
        onConfirmarFinalizar={handleConfirmarFinalizarAsig}
        isPending={finalizarEmpleadoGrupoMutation.isPending}
      />
    </div>
  );
}
