import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog, FormField } from "@/shared/components";
import { Alert, Textarea } from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { useDecidirSolicitudAusencia } from "../hooks/useSolicitudesAusenciaAdministrativas";
import type { AccionAdministrativaAusencia } from "../types/solicitudAusenciaAdministrativa.types";

const CONFIG = {
  aceptar: {
    titulo: "Aceptar solicitud de ausencia",
    descripcion: "La solicitud pasará a Aceptada. Las asistencias en Pendiente de ingreso o Ausente podrán pasar a Ausencia justificada. Las asistencias en otros estados se conservarán. Si el período incluye la fecha actual, el empleado podrá pasar a Licencia.",
    exito: "La solicitud fue aceptada correctamente.",
  },
  rechazar: {
    titulo: "Rechazar solicitud de ausencia",
    descripcion: "El motivo quedará registrado en el historial y será visible para el empleado. El rechazo no modifica las asistencias asociadas.",
    exito: "La solicitud fue rechazada correctamente.",
  },
  revocar: {
    titulo: "Revocar solicitud de ausencia",
    descripcion: "La solicitud dejará de considerarse válida. Las asistencias justificadas asociadas podrán volver a Pendiente de ingreso o Ausente, según la finalización de cada jornada.",
    exito: "La solicitud fue revocada correctamente.",
  },
};
export function DecisionSolicitudAusenciaDialog({ id, accion, onClose }: { id: number; accion: AccionAdministrativaAusencia; onClose: () => void }) {
  const mutation = useDecidirSolicitudAusencia(id);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState<string>();
  const [errorEnvio, setErrorEnvio] = useState<string>();
  const config = CONFIG[accion];
  const confirmar = async () => {
    if (mutation.isPending) return;
    const texto = motivo.trim();
    if (accion !== "aceptar" && !texto) {
      setErrorMotivo(`Ingresá un motivo para ${accion} la solicitud.`);
      return;
    }
    if (texto.length > 500) {
      setErrorMotivo("El motivo no puede superar los 500 caracteres.");
      return;
    }
    setErrorMotivo(undefined);
    setErrorEnvio(undefined);
    try {
      await mutation.mutateAsync({ accion, motivo: accion === "aceptar" ? undefined : texto });
      toast.success(config.exito);
      onClose();
    } catch (error) { setErrorEnvio(normalizeApiError(error, "No se pudo registrar la decisión.").message); }
  };
  return <ConfirmDialog open title={config.titulo} description={config.descripcion}
    confirmLabel={`Confirmar ${accion === "aceptar" ? "aceptación" : accion === "rechazar" ? "rechazo" : "revocación"}`}
    destructive={accion !== "aceptar"} pending={mutation.isPending}
    onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }} onConfirm={() => void confirmar()}>
    {accion !== "aceptar" && <FormField id="decision-ausencia-motivo" label={accion === "rechazar" ? "Motivo de rechazo" : "Motivo de revocación"}
      icon={MessageSquare} required error={errorMotivo} hint={`${motivo.length}/500 caracteres`}>
      <Textarea id="decision-ausencia-motivo" autoFocus rows={4} maxLength={500} disabled={mutation.isPending}
        value={motivo} onChange={(event) => { setMotivo(event.target.value); setErrorMotivo(undefined); }}
        aria-invalid={!!errorMotivo} aria-describedby={errorMotivo ? "decision-ausencia-motivo-error" : "decision-ausencia-motivo-hint"} />
    </FormField>}
    {errorEnvio && <Alert variant="error" role="alert">{errorEnvio}</Alert>}
  </ConfirmDialog>;
}

