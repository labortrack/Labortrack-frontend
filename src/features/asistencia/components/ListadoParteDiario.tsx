import { Link } from "react-router-dom";
import { ArrowRight, Building2, Clock3, Users } from "lucide-react";
import type { AsistenciaParteDiarioResponseDto } from "../types/asistencia.types";
import { formatHora } from "../utils/asistenciaFormatters";
import { AsistenciaStatusBadge } from "./AsistenciaStatusBadge";
import { TrabajadorAvatar } from "./TrabajadorAvatar";
import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";

interface ListadoParteDiarioProps {
  asistencias: AsistenciaParteDiarioResponseDto[];
  fechaLabel: string;
  filtrosBusqueda: string;
}

export function ListadoParteDiario({
  asistencias,
  fechaLabel,
  filtrosBusqueda,
}: ListadoParteDiarioProps) {
  const detalleUrl = (asistenciaId: number) =>
    `/asistencias/${asistenciaId}${filtrosBusqueda}`;

  return (
    <section aria-labelledby="listado-parte-diario" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="listado-parte-diario" className="text-base font-semibold">
            Registros del {fechaLabel}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {asistencias.length} {asistencias.length === 1 ? "asistencia" : "asistencias"}
          </p>
        </div>
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajador</TableHead>
              <TableHead>Obra</TableHead>
              <TableHead>Cuadrilla</TableHead>
              <TableHead className="text-center">Ingreso</TableHead>
              <TableHead className="text-center">Egreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {asistencias.map((asistencia) => (
              <TableRow key={asistencia.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <TrabajadorAvatar
                      nombre={asistencia.trabajador}
                      fotoUrl={asistencia.fotoTrabajador}
                    />
                    <span className="font-semibold text-foreground">
                      {asistencia.trabajador}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{asistencia.obra.nombre}</TableCell>
                <TableCell className="text-foreground-muted">
                  {asistencia.cuadrilla}
                </TableCell>
                <TableCell className="text-center">
                  {formatHora(asistencia.fechaHoraIngreso)}
                </TableCell>
                <TableCell className="text-center">
                  {formatHora(asistencia.fechaHoraEgreso)}
                </TableCell>
                <TableCell>
                  <AsistenciaStatusBadge estado={asistencia.estado} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="link" size="sm">
                    <Link to={detalleUrl(asistencia.id)}>Ver detalle</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="space-y-3 lg:hidden">
        {asistencias.map((asistencia) => (
          <Card key={asistencia.id}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <TrabajadorAvatar
                    nombre={asistencia.trabajador}
                    fotoUrl={asistencia.fotoTrabajador}
                  />
                  <span className="font-semibold text-foreground">
                    {asistencia.trabajador}
                  </span>
                </div>
                <AsistenciaStatusBadge estado={asistencia.estado} />
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 shrink-0 text-foreground-muted" />
                  <span>{asistencia.obra.nombre}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Users className="size-4 shrink-0" />
                  <span>{asistencia.cuadrilla}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground-muted sm:col-span-2">
                  <Clock3 className="size-4 shrink-0" />
                  <span>
                    Ingreso {formatHora(asistencia.fechaHoraIngreso)} · Egreso{" "}
                    {formatHora(asistencia.fechaHoraEgreso)}
                  </span>
                </div>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={detalleUrl(asistencia.id)}>
                  Ver detalle
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
