import type { ReactNode } from "react";
import { Ban } from "lucide-react";
import { useDetalleRecibo } from "../hooks/useRecibosSueldo";
import type {
  ColumnaRecibo,
  ReciboSueldoDetalleDto,
} from "../types/reciboSueldo.types";
import {
  ESTADO_RECIBO_BADGE_VARIANT,
  ESTADO_RECIBO_LABELS,
  armarFilasRecibo,
  formatCantidad,
  formatHoras,
  totalDeducciones,
} from "../utils/reciboSueldo";
import {
  formatFecha,
  formatFechaHora,
} from "@/features/periodoLiquidacion/utils/periodoLiquidacion";
import {
  AccionesBorrador,
  AgregarItemCatalogo,
  QuitarLineaButton,
} from "./AjustesRecibo";
import { DocumentoRecibo } from "./DocumentoRecibo";
import { EmpleadoReciboAvatar } from "./EmpleadoReciboAvatar";
import { ErrorState, LoadingState } from "@/shared/components";
import {
  Alert,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import { formatCurrency } from "@/shared/utils/currency";
import { cn } from "@/shared/utils/cn";

const COLUMNAS: ColumnaRecibo[] = ["REMUNERATIVO", "NO_REMUNERATIVO", "DEDUCCION"];

export function DetalleReciboDialog({
  reciboId,
  onClose,
}: {
  reciboId: number | null;
  onClose: () => void;
}) {
  const query = useDetalleRecibo(reciboId);

  return (
    <Dialog
      open={reciboId != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-4xl">
        {query.isPending ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Detalle del recibo</DialogTitle>
              <DialogDescription>Cargando el detalle del recibo.</DialogDescription>
            </DialogHeader>
            <LoadingState label="Cargando recibo..." />
          </>
        ) : query.isError ? (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Detalle del recibo</DialogTitle>
              <DialogDescription>No se pudo cargar el recibo.</DialogDescription>
            </DialogHeader>
            <ErrorState
              message={
                normalizeApiError(query.error, "No se pudo obtener el recibo.")
                  .message
              }
              onRetry={() => void query.refetch()}
            />
          </>
        ) : (
          <DetalleRecibo recibo={query.data} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetalleRecibo({ recibo }: { recibo: ReciboSueldoDetalleDto }) {
  // RF057: solo un recibo en BORRADOR admite ajustes.
  const editable = recibo.estado === "BORRADOR";
  const filas = armarFilasRecibo(recibo);
  const deducciones = totalDeducciones(recibo);
  const totalesPorColumna: Record<ColumnaRecibo, number> = {
    REMUNERATIVO: recibo.totalRemunerativo,
    NO_REMUNERATIVO: recibo.totalNoRemunerativo,
    DEDUCCION: deducciones,
  };

  return (
    <div className="min-w-0 space-y-5">
      <DialogHeader>
        <div className="flex items-start gap-3">
          <EmpleadoReciboAvatar
            empleadoId={recibo.empleadoId}
            apellidoNombre={recibo.apellidoNombre}
            fotoPerfilKey={recibo.fotoPerfilKey}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle>{recibo.apellidoNombre}</DialogTitle>
              <Badge variant={ESTADO_RECIBO_BADGE_VARIANT[recibo.estado]}>
                {ESTADO_RECIBO_LABELS[recibo.estado]}
              </Badge>
            </div>
            <DialogDescription>
              CUIL {recibo.cuil} · {recibo.categoria} · {recibo.zona}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-subtle p-4 sm:grid-cols-4">
        <Dato label="Período">
          {recibo.descripcionPeriodo}
          <span className="block text-xs font-normal text-foreground-muted">
            {formatFecha(recibo.fechaDesde)} al {formatFecha(recibo.fechaHasta)}
          </span>
        </Dato>
        <Dato label="Fecha del recibo">{formatFecha(recibo.fechaRecibo)}</Dato>
        <Dato label="Fecha de ingreso">{formatFecha(recibo.fechaIngreso)}</Dato>
        <Dato label="Horas liquidadas">
          {formatHoras(recibo.cantidadDeHoras)}
        </Dato>
        <Dato label="Valor hora básico">
          {formatCurrency(recibo.valorHoraBasico)}
        </Dato>
        <Dato label="Valor hora adicional">
          {formatCurrency(recibo.valorHoraAdicional)}
        </Dato>
        <Dato label="Valor hora total">
          {formatCurrency(recibo.valorHoraTotal)}
        </Dato>
        <Dato label="Lectura confirmada">
          {recibo.fechaHoraLectura
            ? `${formatFechaHora(recibo.fechaHoraLectura)} hs`
            : "—"}
        </Dato>
      </dl>

      {recibo.motivoCancelacion ? (
        <Alert variant="error">
          <Ban className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium">Motivo de la cancelación</p>
            <p className="mt-0.5 break-words">{recibo.motivoCancelacion}</p>
          </div>
        </Alert>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-subtle">
            <TableHead className="min-w-[200px]">Concepto</TableHead>
            <TableHead className="w-[90px] text-right">C/Hs./%</TableHead>
            <TableHead className="min-w-[130px] text-right">Remunerativo</TableHead>
            <TableHead className="min-w-[130px] text-right">
              No remunerativo
            </TableHead>
            <TableHead className="min-w-[130px] text-right">Deducciones</TableHead>
            {editable ? (
              <TableHead className="w-[48px]">
                <span className="sr-only">Acciones</span>
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((fila, idx) => (
            <TableRow key={`${fila.descripcion}-${idx}`}>
              <TableCell className="font-medium">{fila.descripcion}</TableCell>
              <TableCell className="text-right tabular-nums text-foreground-muted">
                {formatCantidad(fila.cantidad)}
              </TableCell>
              {COLUMNAS.map((columna) => (
                <TableCell
                  key={columna}
                  className={cn(
                    "text-right tabular-nums",
                    columna === "DEDUCCION" && "text-error",
                  )}
                >
                  {fila.columna === columna ? formatCurrency(fila.valor) : ""}
                </TableCell>
              ))}
              {editable ? (
                <TableCell className="py-1 text-right">
                  <QuitarLineaButton reciboId={recibo.id} linea={fila} />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
          <TableRow className="border-t-2 border-border bg-subtle font-semibold">
            <TableCell colSpan={2}>Totales</TableCell>
            {COLUMNAS.map((columna) => (
              <TableCell
                key={columna}
                className={cn(
                  "text-right tabular-nums",
                  columna === "DEDUCCION" && "text-error",
                )}
              >
                {formatCurrency(totalesPorColumna[columna])}
              </TableCell>
            ))}
            {editable ? <TableCell /> : null}
          </TableRow>
        </TableBody>
      </Table>

      {editable ? <AgregarItemCatalogo recibo={recibo} /> : null}

      <div className="ml-auto max-w-sm space-y-2 rounded-lg border border-success/20 bg-success-soft p-4 text-sm">
        <Total label="Total bruto" valor={recibo.totalBruto} />
        <Total
          label="Total deducciones"
          valor={-deducciones}
          className="text-error"
        />
        <div className="flex items-center justify-between border-t border-success/20 pt-2">
          <span className="font-semibold text-foreground">Neto a cobrar</span>
          <span className="text-xl font-bold tabular-nums text-success">
            {formatCurrency(recibo.totalNeto)}
          </span>
        </div>
      </div>

      {editable ? (
        <div className="border-t border-border pt-4">
          <AccionesBorrador recibo={recibo} />
        </div>
      ) : recibo.estado === "GENERADO" || recibo.documentoId != null ? (
        <div className="border-t border-border pt-4">
          <DocumentoRecibo recibo={recibo} />
        </div>
      ) : null}
    </div>
  );
}

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-foreground">{children}</dd>
    </div>
  );
}

function Total({
  label,
  valor,
  className,
}: {
  label: string;
  valor: number;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground-muted">{label}</span>
      <span className={cn("font-semibold tabular-nums text-foreground", className)}>
        {formatCurrency(valor)}
      </span>
    </div>
  );
}
