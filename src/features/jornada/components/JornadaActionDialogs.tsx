import { useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Ban, Clock3, Info, MessageSquare, Pencil, TriangleAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormField } from "@/shared/components";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import {
  Alert, Button, Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, Input, RadioGroup, RadioGroupItem, Spinner, Textarea,
} from "@/shared/ui";
import { useAnularJornada, useDefinirDecisionJornada, useModificarHorarioJornada, jornadasKeys } from "../hooks/useJornadas";
import type { JornadaDetalle } from "../types/jornada.types";
import type { DecisionDiaNoLaborable } from "../types/planTrabajo.types";
import { decisionLabels, estadoJornadaLabels, formatDate, formatTime, tipoJornadaLabels } from "../utils/planTrabajoFormatters";

interface DialogProps {
  jornada: JornadaDetalle;
  onClose: () => void;
}

function useErrorAccion(jornadaId: number) {
  const queryClient = useQueryClient();
  const [errorEnvio, setErrorEnvio] = useState<string>();
  const [desactualizada, setDesactualizada] = useState(false);

  const manejarError = (error: unknown, fallback: string) => {
    const apiError = normalizeApiError(error, fallback);
    if (apiError.status === 409) {
      setDesactualizada(true);
      setErrorEnvio(`${apiError.message} Cerrá esta ventana y revisá los datos actualizados antes de intentarlo nuevamente.`);
      void queryClient.invalidateQueries({ queryKey: jornadasKeys.detail(jornadaId) });
    } else {
      setErrorEnvio(apiError.message);
    }
  };

  return { errorEnvio, setErrorEnvio, desactualizada, manejarError };
}

function ContextoJornada({ jornada }: { jornada: JornadaDetalle }) {
  const fields = [
    ["Obra", jornada.obraNombre],
    ["Cuadrilla", jornada.cuadrillaNombre],
    ["Plan asociado", `Plan de trabajo #${jornada.planTrabajoId}`],
    ["Fecha", formatDate(jornada.fecha)],
    ["Tipo de jornada", tipoJornadaLabels[jornada.tipo]],
    ["Estado actual", estadoJornadaLabels[jornada.estado]],
    ["Condición", jornada.extraordinaria ? "Extraordinaria" : "Ordinaria"],
  ];

  return (
    <dl className="grid gap-4 rounded-lg border border-border bg-muted p-4 sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{label}</dt>
          <dd className="mt-1 break-words text-sm font-semibold text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ErrorEnvio({ mensaje }: { mensaje?: string }) {
  return mensaje ? <Alert variant="error"><AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{mensaje}</span></Alert> : null;
}

function ActionDialog({
  title, description, icon: Icon, jornada, onClose, pending, onSubmit,
  confirmLabel, pendingLabel, destructive = false, disabled = false, children,
}: DialogProps & {
  title: string;
  description: string;
  icon: typeof Pencil;
  pending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  confirmLabel: string;
  pendingLabel: string;
  destructive?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose(); }}>
      <DialogContent className="max-w-2xl" aria-busy={pending}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${destructive ? "bg-error-soft text-error" : "bg-primary-soft text-primary"}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate>
          <div className="space-y-5">
            <ContextoJornada jornada={jornada} />
            {children}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>Volver</Button>
            <Button type="submit" variant={destructive ? "destructive" : "primary"} disabled={pending || disabled}>
              {pending ? <Spinner className="text-white" /> : null}
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ModificarHorarioJornadaDialog({ jornada, onClose }: DialogProps) {
  const mutation = useModificarHorarioJornada(jornada.id);
  const { errorEnvio, setErrorEnvio, desactualizada, manejarError } = useErrorAccion(jornada.id);
  const [inicio, setInicio] = useState(formatTime(jornada.horaInicioPlanificada));
  const [fin, setFin] = useState(formatTime(jornada.horaFinPlanificada));
  const [errorInicio, setErrorInicio] = useState<string>();
  const [errorFin, setErrorFin] = useState<string>();
  const [errorHorario, setErrorHorario] = useState<string>();
  const puedeInicio = jornada.puedeModificarHoraInicio;
  const puedeFin = jornada.puedeModificarHoraFin;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending || desactualizada) return;
    const nuevaHoraInicio = inicio === formatTime(jornada.horaInicioPlanificada) ? jornada.horaInicioPlanificada : inicio;
    const nuevaHoraFin = fin === formatTime(jornada.horaFinPlanificada) ? jornada.horaFinPlanificada : fin;
    setErrorInicio(undefined);
    setErrorFin(undefined);
    setErrorHorario(undefined);
    if (!inicio) {
      setErrorInicio("Ingresá una hora de inicio válida.");
      return;
    }
    if (!fin) {
      setErrorFin("Ingresá una hora de fin válida.");
      return;
    }
    if (inicio >= fin) {
      setErrorFin("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }
    if (nuevaHoraInicio === jornada.horaInicioPlanificada && nuevaHoraFin === jornada.horaFinPlanificada) {
      setErrorHorario("Modificá al menos una de las horas permitidas.");
      return;
    }
    setErrorEnvio(undefined);
    try {
      const result = await mutation.mutateAsync({
        estadoActual: jornada.estado,
        horaInicioActual: jornada.horaInicioPlanificada,
        horaFinActual: jornada.horaFinPlanificada,
        nuevaHoraInicio,
        nuevaHoraFin,
      });
      toast.success(result.mensaje);
      onClose();
    } catch (error) {
      manejarError(error, "No se pudo modificar el horario de la jornada.");
    }
  };

  return (
    <ActionDialog jornada={jornada} onClose={onClose} title="Modificar horario de jornada" description="Actualizá únicamente las horas planificadas que todavía admiten cambios." icon={Clock3} pending={mutation.isPending} onSubmit={(event) => { void submit(event); }} confirmLabel="Guardar cambios" pendingLabel="Guardando…" disabled={desactualizada}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="jornada-hora-inicio" label="Hora de inicio planificada" icon={Clock3} error={errorInicio} hint={!puedeInicio ? "La hora de inicio ya no puede modificarse." : undefined} required>
          <Input id="jornada-hora-inicio" type="time" value={inicio} disabled={!puedeInicio || mutation.isPending || desactualizada} aria-invalid={Boolean(errorInicio)} aria-describedby={errorInicio ? "jornada-hora-inicio-error" : !puedeInicio ? "jornada-hora-inicio-hint" : undefined} onChange={(event) => { setInicio(event.target.value); setErrorInicio(undefined); setErrorFin(undefined); setErrorHorario(undefined); }} />
        </FormField>
        <FormField id="jornada-hora-fin" label="Hora de fin planificada" icon={Clock3} error={errorFin} hint={!puedeFin ? "La hora de fin ya no puede modificarse." : undefined} required>
          <Input id="jornada-hora-fin" type="time" value={fin} disabled={!puedeFin || mutation.isPending || desactualizada} aria-invalid={Boolean(errorFin)} aria-describedby={errorFin ? "jornada-hora-fin-error" : !puedeFin ? "jornada-hora-fin-hint" : undefined} onChange={(event) => { setFin(event.target.value); setErrorFin(undefined); setErrorHorario(undefined); }} />
        </FormField>
      </div>
      <Alert><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>La fecha, el plan, la cuadrilla, el tipo y la decisión de día no laborable no cambiarán.</span></Alert>
      <ErrorEnvio mensaje={errorHorario} />
      <ErrorEnvio mensaje={errorEnvio} />
    </ActionDialog>
  );
}

export function DefinirDecisionJornadaDialog({ jornada, onClose }: DialogProps) {
  const mutation = useDefinirDecisionJornada(jornada.id);
  const { errorEnvio, setErrorEnvio, desactualizada, manejarError } = useErrorAccion(jornada.id);
  const [decision, setDecision] = useState<DecisionDiaNoLaborable>(jornada.decisionDiaNoLaborable);
  const [errorDecision, setErrorDecision] = useState<string>();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending || desactualizada) return;
    if (decision === jornada.decisionDiaNoLaborable || decision === "NO_APLICA") {
      setErrorDecision("Elegí una decisión diferente de la vigente.");
      return;
    }
    setErrorDecision(undefined);
    setErrorEnvio(undefined);
    try {
      const result = await mutation.mutateAsync({
        estadoActual: jornada.estado,
        decisionActual: jornada.decisionDiaNoLaborable,
        horaInicioActual: jornada.horaInicioPlanificada,
        horaFinActual: jornada.horaFinPlanificada,
        nuevaDecision: decision,
      });
      toast.success(result.mensaje);
      onClose();
    } catch (error) {
      manejarError(error, "No se pudo actualizar la decisión de esta jornada.");
    }
  };

  return (
    <ActionDialog jornada={jornada} onClose={onClose} title="Definir decisión de día no laborable" description="Indicá si esta jornada será trabajada por la cuadrilla." icon={Pencil} pending={mutation.isPending} onSubmit={(event) => { void submit(event); }} confirmLabel="Guardar decisión" pendingLabel="Guardando…" disabled={desactualizada}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Horario planificado</p><p className="mt-1 text-sm font-semibold">{formatTime(jornada.horaInicioPlanificada)} a {formatTime(jornada.horaFinPlanificada)}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Decisión vigente</p><p className="mt-1 text-sm font-semibold">{decisionLabels[jornada.decisionDiaNoLaborable]}</p></div>
      </div>
      <fieldset disabled={mutation.isPending || desactualizada}>
        <legend className="mb-2 text-sm font-semibold">Nueva decisión</legend>
        <RadioGroup value={decision} onValueChange={(value) => { setDecision(value as DecisionDiaNoLaborable); setErrorDecision(undefined); }} className="grid gap-3 sm:grid-cols-2" aria-invalid={Boolean(errorDecision)} aria-describedby={errorDecision ? "jornada-decision-error" : undefined}>
          {(["SE_TRABAJA", "NO_SE_TRABAJA"] as const).map((value) => (
            <label key={value} htmlFor={`jornada-decision-${value}`} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${decision === value ? "border-primary bg-primary-soft" : "border-border-strong bg-card"}`}>
              <RadioGroupItem id={`jornada-decision-${value}`} value={value} disabled={mutation.isPending || desactualizada} />
              <span className="text-sm font-semibold">{decisionLabels[value]}</span>
            </label>
          ))}
        </RadioGroup>
        {errorDecision ? <p id="jornada-decision-error" className="mt-2 text-xs font-medium text-error">{errorDecision}</p> : null}
      </fieldset>
      <Alert><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{decision === jornada.decisionDiaNoLaborable ? "Seleccioná una decisión diferente de la vigente para actualizar la jornada." : decision === "NO_SE_TRABAJA" ? "La jornada pasará a No trabajada. Las asistencias asociadas sin actividad, incluidas las justificadas por ausencias aceptadas, pasarán a No trabajada computable." : "La jornada volverá a Programada. Las asistencias sin actividad volverán a Ausencia justificada si tienen una solicitud aceptada aplicable; las demás, a Pendiente de ingreso."}</span></Alert>
      <ErrorEnvio mensaje={errorEnvio} />
    </ActionDialog>
  );
}

export function AnularJornadaDialog({ jornada, onClose }: DialogProps) {
  const mutation = useAnularJornada(jornada.id);
  const { errorEnvio, setErrorEnvio, desactualizada, manejarError } = useErrorAccion(jornada.id);
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState<string>();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending || desactualizada) return;
    const motivoNormalizado = motivo.trim();
    if (!motivoNormalizado || motivoNormalizado.length > 500) {
      setErrorMotivo(!motivoNormalizado ? "Ingresá el motivo de anulación." : "El motivo no puede superar los 500 caracteres.");
      return;
    }
    setErrorMotivo(undefined);
    setErrorEnvio(undefined);
    try {
      await mutation.mutateAsync({
        estadoActual: jornada.estado,
        decisionActual: jornada.decisionDiaNoLaborable,
        horaInicioActual: jornada.horaInicioPlanificada,
        horaFinActual: jornada.horaFinPlanificada,
        motivo: motivoNormalizado,
      });
      toast.success("Jornada anulada correctamente.");
      onClose();
    } catch (error) {
      manejarError(error, "No se pudo anular la jornada.");
    }
  };

  return (
    <ActionDialog jornada={jornada} onClose={onClose} title="Anular jornada de trabajo" description="Registrá el motivo por el que esta jornada no debe realizarse." icon={Ban} pending={mutation.isPending} onSubmit={(event) => { void submit(event); }} confirmLabel="Confirmar anulación" pendingLabel="Anulando…" destructive disabled={desactualizada}>
      <div><p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">Horario planificado</p><p className="mt-1 text-sm font-semibold">{formatTime(jornada.horaInicioPlanificada)} a {formatTime(jornada.horaFinPlanificada)}</p></div>
      <Alert variant="warning"><TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>La jornada no se eliminará: quedará como antecedente administrativo. Las asistencias asociadas sin ingresos ni egresos se anularán con el mismo motivo.</span></Alert>
      <FormField id="jornada-motivo-anulacion" label="Motivo de anulación" icon={MessageSquare} required error={errorMotivo} hint={`${motivo.length}/500 caracteres`}>
        <Textarea id="jornada-motivo-anulacion" autoFocus rows={4} maxLength={500} value={motivo} disabled={mutation.isPending || desactualizada} placeholder="Explicá por qué se anula esta jornada." aria-invalid={Boolean(errorMotivo)} aria-describedby={errorMotivo ? "jornada-motivo-anulacion-error" : "jornada-motivo-anulacion-hint"} onChange={(event) => { setMotivo(event.target.value); setErrorMotivo(undefined); }} />
      </FormField>
      <ErrorEnvio mensaje={errorEnvio} />
    </ActionDialog>
  );
}
