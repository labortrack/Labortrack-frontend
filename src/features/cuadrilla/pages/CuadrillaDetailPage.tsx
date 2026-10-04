import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  EllipsisVertical,
  Pencil,
  RotateCcw,
  Trash2,
  UserCheck,
} from "lucide-react";
import {
  BackLink,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/shared/components";
import {
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui";
import { useCuadrilla } from "../hooks/useCuadrillas";
import { CuadrillaDetailView } from "../components/CuadrillaDetailView";
import { EditCuadrillaDialog } from "../components/dialogs/EditCuadrillaDialog";
import { BajaCuadrillaDialog } from "../components/dialogs/BajaCuadrillaDialog";
import { ReactivarCuadrillaDialog } from "../components/dialogs/ReactivarCuadrillaDialog";
import { AsignarLiderDialog } from "../components/dialogs/AsignarLiderDialog";
import { AsignarOperarioDialog } from "../components/dialogs/AsignarOperarioDialog";
import { DesvincularOperarioDialog } from "../components/dialogs/DesvincularOperarioDialog";
import type { EmpleadoGrupoCuadrillaResponseDto } from "../types/cuadrilla.types";

export default function CuadrillaDetailPage() {
  const { obraId: paramObraId, cuadrillaId: paramCuadrillaId } = useParams<{
    obraId: string;
    cuadrillaId: string;
  }>();
  const obraId = Number(paramObraId);
  const cuadrillaId = Number(paramCuadrillaId);

  const cuadrillaQuery = useCuadrilla(cuadrillaId);
  const cuadrilla = cuadrillaQuery.data;

  // Dialog States
  const [editOpen, setEditOpen] = useState(false);
  const [bajaOpen, setBajaOpen] = useState(false);
  const [reactivarOpen, setReactivarOpen] = useState(false);
  const [liderOpen, setLiderOpen] = useState(false);
  const [asignarOperarioOpen, setAsignarOperarioOpen] = useState(false);
  const [desvincularOperario, setDesvincularOperario] =
    useState<EmpleadoGrupoCuadrillaResponseDto | null>(null);

  const backTo = `/obras/${obraId}/cuadrillas`;

  if (cuadrillaQuery.isPending) {
    return (
      <div className="space-y-6">
        <BackLink to={backTo} />
        <Card className="p-12">
          <LoadingState label="Cargando información de la cuadrilla..." />
        </Card>
      </div>
    );
  }

  // La cuadrilla debe pertenecer a la obra de la URL.
  if (cuadrillaQuery.isError || !cuadrilla || cuadrilla.obra?.id !== obraId) {
    return (
      <div className="space-y-6">
        <BackLink to={backTo} />
        <Card className="p-8">
          <ErrorState
            message="No se pudo cargar la cuadrilla solicitada para esta obra."
            onRetry={() => void cuadrillaQuery.refetch()}
          />
        </Card>
      </div>
    );
  }

  const isSuspended = cuadrilla.estadoActual === "SUSPENDIDA";
  const isFinalizada = cuadrilla.estadoActual === "FINALIZADA";
  const isCerrada = isSuspended || isFinalizada;
  return (
    <div className="space-y-6">
      {/* ── Breadcrumb / Header ───────────────────────────────── */}
      <div>
        <BackLink to={backTo} label="Volver a cuadrillas" />

        <PageHeader
          title={`Detalle de Cuadrilla: ${cuadrilla.nombre}`}
          description="Nómina, planes de trabajo y estado operativo de la cuadrilla asignada al frente."
          actions={
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
                disabled={isCerrada}
                className="w-full justify-center gap-1.5 font-semibold sm:w-auto"
              >
                <Pencil className="size-4" />
                Modificar Cuadrilla
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-center sm:w-auto"
                  >
                    <EllipsisVertical className="mr-1.5 size-4" />
                    Más Acciones
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    disabled={isCerrada}
                    onSelect={() => setLiderOpen(true)}
                  >
                    <UserCheck className="size-4 text-foreground-muted" />
                    {cuadrilla.lider ? "Cambiar Líder" : "Asignar Líder"}
                  </DropdownMenuItem>
                  {isSuspended ? (
                    <DropdownMenuItem onSelect={() => setReactivarOpen(true)}>
                      <RotateCcw className="size-4 text-foreground-muted" />
                      Reactivar Cuadrilla
                    </DropdownMenuItem>
                  ) : !isFinalizada ? (
                    <DropdownMenuItem
                      onSelect={() => setBajaOpen(true)}
                      className="text-error data-[highlighted]:text-error"
                    >
                      <Trash2 className="size-4" />
                      Dar de Baja
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />
      </div>

      <CuadrillaDetailView
        cuadrilla={cuadrilla}
        onAsignarOperario={() => setAsignarOperarioOpen(true)}
        onDesvincularOperario={(op) => setDesvincularOperario(op)}
      />

      {/* ── Dialogs ────────────────────────────────────────────── */}
      <EditCuadrillaDialog
        obraId={obraId}
        cuadrilla={editOpen ? cuadrilla : null}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <BajaCuadrillaDialog
        obraId={obraId}
        cuadrilla={bajaOpen ? cuadrilla : null}
        open={bajaOpen}
        onOpenChange={setBajaOpen}
      />

      <ReactivarCuadrillaDialog
        obraId={obraId}
        cuadrilla={reactivarOpen ? cuadrilla : null}
        open={reactivarOpen}
        onOpenChange={setReactivarOpen}
      />

      <AsignarLiderDialog
        obraId={obraId}
        cuadrilla={liderOpen ? cuadrilla : null}
        open={liderOpen}
        onOpenChange={setLiderOpen}
      />

      <AsignarOperarioDialog
        obraId={obraId}
        cuadrilla={asignarOperarioOpen ? cuadrilla : null}
        open={asignarOperarioOpen}
        onOpenChange={setAsignarOperarioOpen}
      />

      <DesvincularOperarioDialog
        obraId={obraId}
        cuadrillaId={cuadrilla.id}
        operario={desvincularOperario}
        open={Boolean(desvincularOperario)}
        onOpenChange={(open) => !open && setDesvincularOperario(null)}
      />
    </div>
  );
}
