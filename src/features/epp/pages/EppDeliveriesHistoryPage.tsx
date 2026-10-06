import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ClipboardCheck,
  Package,
  Plus,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEntregasPaginadas } from "../hooks/useEpp";
import { EppDeliveryModal } from "../components/modals/EppDeliveryModal";
import {
  ErrorState,
  EmptyState,
  PageHeader,
  Pagination,
} from "@/shared/components";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { normalizeApiError } from "@/shared/lib/http/apiError";
import {
  HistorialAuditoriaIconButton,
  useEsAdminAuditoria,
  useHistorialAuditoriaDialog,
} from "@/features/auditoria";

function formatFecha(fecha: string): string {
  if (!fecha) return "-";
  const [datePart] = fecha.split("T");
  const parts = datePart.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return fecha;
}

export function EppDeliveriesHistoryPage() {
  const [page, setPage] = useState(0);
  const size = 10;
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const esAdmin = useEsAdminAuditoria();
  const { abrirHistorial, renderDialog } = useHistorialAuditoriaDialog();

  const { data, isLoading, isError, error, refetch } = useEntregasPaginadas(
    page,
    size,
  );

  const entregas = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      {/* Encabezado con navegación hacia inventario y acción de entrega */}
      <PageHeader
        title="Historial de Entregas de EPP"
        description="Auditoría cronológica y registro de equipos de protección personal entregados a los operarios."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <Link to="/higiene-seguridad">
                <ArrowLeft className="size-4" />
                Volver a Inventario
              </Link>
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsDeliveryModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="size-4" />
              Nueva Entrega
            </Button>
          </div>
        }
      />

      {/* Resumen de entregas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="shadow-soft">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary">
              <ClipboardCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Total Entregas Realizadas
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalElements}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-success-soft text-success">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                Páginas Registradas
              </p>
              <p className="text-2xl font-bold text-foreground">
                {totalPages > 0 ? `${page + 1} de ${totalPages}` : "0"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla con estados de carga, error y datos */}
      {isLoading ? (
        <div className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-24" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-card border border-border bg-card p-6 shadow-soft">
          <ErrorState
            message={
              normalizeApiError(
                error,
                "No se pudo cargar el historial de entregas de EPP.",
              ).message
            }
            onRetry={() => refetch()}
          />
        </div>
      ) : entregas.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-6 shadow-soft">
          <EmptyState
            title="No hay entregas registradas"
            description="Aún no se han registrado asignaciones de equipo de protección a ningún empleado."
            action={
              <Button
                variant="primary"
                onClick={() => setIsDeliveryModalOpen(true)}
              >
                Registrar primera entrega
              </Button>
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={esAdmin ? "w-[16%]" : "w-[18%]"}>Fecha</TableHead>
                <TableHead className={esAdmin ? "w-[34%]" : "w-[37%]"}>Operario</TableHead>
                <TableHead className={esAdmin ? "w-[28%]" : "w-[30%]"}>EPP Entregado</TableHead>
                <TableHead className={esAdmin ? "w-[14%] text-center" : "w-[15%] text-center"}>Cantidad</TableHead>
                {esAdmin && (
                  <TableHead className="w-[8%] text-right">Acciones</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entregas.map((entrega, index) => {
                const operarioNombre = `${entrega.apellidoEmpleado}, ${entrega.nombreEmpleado}`.trim();
                const eppNombre = entrega.nombreEpp;
                const rowKey =
                  entrega.id ??
                  `${entrega.idEpp}-${entrega.idEmpleado}-${entrega.fechaEntrega}-${index}`;

                return (
                  <TableRow key={rowKey}>
                    {/* Fecha */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Calendar className="size-4 text-foreground-muted" />
                        <span>{formatFecha(entrega.fechaEntrega)}</span>
                      </div>
                    </TableCell>

                    {/* Operario */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary font-bold text-xs">
                          <User className="size-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {operarioNombre}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            Legajo / ID #{entrega.idEmpleado}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* EPP Entregado */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Package className="size-4 text-primary shrink-0" />
                        <span className="font-medium text-foreground">
                          {eppNombre}
                        </span>
                      </div>
                    </TableCell>

                    {/* Cantidad */}
                    <TableCell className="text-center">
                      <span className="inline-flex items-center rounded-full bg-subtle px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {entrega.cantidadEntregada}{" "}
                        {entrega.cantidadEntregada === 1 ? "unidad" : "unidades"}
                      </span>
                    </TableCell>

                    {/* Acciones (solo ROLE_ADMIN) */}
                    {esAdmin && (
                      <TableCell className="text-right">
                        {entrega.id != null ? (
                          <HistorialAuditoriaIconButton
                            onAbrir={() =>
                              abrirHistorial(
                                "empleado_epp",
                                entrega.id!,
                                `${operarioNombre} - ${eppNombre} - ${formatFecha(entrega.fechaEntrega)}`,
                              )
                            }
                          />
                        ) : null}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Controles de paginación */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            disabled={isLoading}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Modal para registrar entrega */}
      <EppDeliveryModal
        open={isDeliveryModalOpen}
        onOpenChange={setIsDeliveryModalOpen}
      />

      {renderDialog()}
    </div>
  );
}

export default EppDeliveriesHistoryPage;
