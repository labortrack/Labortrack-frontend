import { useState } from "react";
import { CuadroTarifarioMatrix } from "./CuadroTarifarioMatrix";
import { EditarCuadroTarifarioDialog } from "./EditarCuadroTarifarioDialog";

export function CuadroTarifarioTab() {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <CuadroTarifarioMatrix onEditar={() => setEditOpen(true)} />

      <EditarCuadroTarifarioDialog open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
