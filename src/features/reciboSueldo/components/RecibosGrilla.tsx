import { useMemo, useState } from "react";
import { Banknote, ChevronRight, FileText, Wallet } from "lucide-react";
import { DetalleReciboDialog } from "./DetalleReciboDialog";
import type {
  FiltroEstadoRecibo,
  ReciboSueldoGrillaDto,
} from "../types/reciboSueldo.types";
import {
  ESTADOS_RECIBO,
  ESTADO_RECIBO_BADGE_VARIANT,
  ESTADO_RECIBO_LABELS,
  formatHoras,
} from "../utils/reciboSueldo";
import { EmpleadoReciboAvatar } from "./EmpleadoReciboAvatar";
import { EmptyState, SearchInput } from "@/shared/components";
import {
  Badge,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui";
import { formatCurrency } from "@/shared/utils/currency";
import { normalizeSearchText } from "@/shared/utils/normalizeText";
import { cn } from "@/shared/utils/cn";

export function RecibosGrilla({
  recibos,
}: {
  recibos: ReciboSueldoGrillaDto[];
}) {
  const [filtro, setFiltro] = useState<FiltroEstadoRecibo>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [reciboAbiertoId, setReciboAbiertoId] = useState<number | null>(null);

  const conteoPorEstado = useMemo(() => {
    const conteo = new Map<FiltroEstadoRecibo, number>([
      ["TODOS", recibos.length],
    ]);
    for (const recibo of recibos) {
      conteo.set(recibo.estado, (conteo.get(recibo.estado) ?? 0) + 1);
    }
    return conteo;
  }, [recibos]);

  const visibles = useMemo(() => {
    const texto = normalizeSearchText(busqueda);
    return recibos.filter(
      (recibo) =>
        (filtro === "TODOS" || recibo.estado === filtro) &&
        normalizeSearchText(recibo.apellidoNombre).includes(texto),
    );
  }, [recibos, filtro, busqueda]);

  // Solo se muestran los estados que tienen recibos, para no llenar la barra de ceros.
  const filtros: FiltroEstadoRecibo[] = [
    "TODOS",
    ...ESTADOS_RECIBO.filter((estado) => conteoPorEstado.has(estado)),
  ];

  return (
    <div className="space-y-4">
      <ResumenRecibos recibos={recibos} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-wrap items-center gap-1 rounded-lg border border-border bg-muted p-1 lg:w-auto">
          {filtros.map((estado) => (
            <button
              key={estado}
              type="button"
              onClick={() => setFiltro(estado)}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 rounded-control px-3 text-xs font-semibold transition-all cursor-pointer",
                filtro === estado
                  ? "bg-card text-primary shadow-soft"
                  : "text-foreground-muted hover:text-foreground",
              )}
            >
              <span>
                {estado === "TODOS" ? "Todos" : ESTADO_RECIBO_LABELS[estado]}
              </span>
              <span className="tabular-nums opacity-70">
                {conteoPorEstado.get(estado) ?? 0}
              </span>
            </button>
          ))}
        </div>

        <SearchInput
          placeholder="Buscar empleado..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          containerClassName="w-full lg:w-72"
          aria-label="Buscar empleado"
        />
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          title="No se encontraron recibos"
          description="Ningún recibo del período coincide con los filtros aplicados."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-subtle">
              <TableHead className="min-w-[220px]">Empleado</TableHead>
              <TableHead className="min-w-[160px]">Categoría</TableHead>
              <TableHead className="min-w-[120px]">Zona</TableHead>
              <TableHead className="min-w-[90px] text-right">Horas</TableHead>
              <TableHead className="min-w-[120px] text-right">Bruto</TableHead>
              <TableHead className="min-w-[120px] text-right">Neto</TableHead>
              <TableHead className="min-w-[150px] text-center">Estado</TableHead>
              <TableHead className="w-[70px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.map((recibo) => {
              const cancelado = recibo.estado === "CANCELADO";
              return (
                <TableRow
                  key={recibo.id}
                  onClick={() => setReciboAbiertoId(recibo.id)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    cancelado ? "bg-subtle/50" : "hover:bg-subtle/40",
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <EmpleadoReciboAvatar
                        empleadoId={recibo.empleadoId}
                        apellidoNombre={recibo.apellidoNombre}
                        fotoPerfilKey={recibo.fotoPerfilKey}
                      />
                      <span
                        className={cn(
                          "font-semibold",
                          cancelado
                            ? "text-foreground-muted line-through"
                            : "text-foreground",
                        )}
                      >
                        {recibo.apellidoNombre}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{recibo.categoria}</TableCell>
                  <TableCell>{recibo.zona}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatHoras(recibo.cantidadDeHoras)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(recibo.totalBruto)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(recibo.totalNeto)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={ESTADO_RECIBO_BADGE_VARIANT[recibo.estado]}>
                      {ESTADO_RECIBO_LABELS[recibo.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-foreground-muted hover:bg-primary-soft hover:text-primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            setReciboAbiertoId(recibo.id);
                          }}
                          aria-label={`Ver recibo de ${recibo.apellidoNombre}`}
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalle</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <DetalleReciboDialog
        reciboId={reciboAbiertoId}
        onClose={() => setReciboAbiertoId(null)}
      />
    </div>
  );
}

// ─── Indicadores del período ────────────────────────────────────────────────

function ResumenRecibos({ recibos }: { recibos: ReciboSueldoGrillaDto[] }) {
  // Un recibo cancelado no se paga: queda fuera de los totales.
  const vigentes = recibos.filter((r) => r.estado !== "CANCELADO");
  const cancelados = recibos.length - vigentes.length;
  const totalBruto = vigentes.reduce((acc, r) => acc + r.totalBruto, 0);
  const totalNeto = vigentes.reduce((acc, r) => acc + r.totalNeto, 0);

  const indicadores = [
    {
      titulo: "Recibos",
      valor: String(vigentes.length),
      detalle:
        cancelados > 0
          ? `${cancelados} cancelado${cancelados !== 1 ? "s" : ""} aparte`
          : "Del período seleccionado",
      icon: FileText,
      color: "bg-primary-soft text-primary",
    },
    {
      titulo: "Total Bruto",
      valor: formatCurrency(totalBruto),
      detalle: "Sin incluir cancelados",
      icon: Banknote,
      color: "bg-warning-soft text-warning",
    },
    {
      titulo: "Total Neto",
      valor: formatCurrency(totalNeto),
      detalle: "A pagar, sin incluir cancelados",
      icon: Wallet,
      color: "bg-success-soft text-success",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {indicadores.map(({ titulo, valor, detalle, icon: Icon, color }) => (
        <Card key={titulo} className="flex items-center gap-3 p-4">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              color,
            )}
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
              {titulo}
            </p>
            <p className="truncate text-xl font-bold tabular-nums text-foreground">
              {valor}
            </p>
            <p className="text-xs text-foreground-muted">{detalle}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
