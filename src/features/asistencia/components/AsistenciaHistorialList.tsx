import { Link } from "react-router-dom";
import { ArrowRight, Building2, Clock3, Users } from "lucide-react";
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
import type { AsistenciaHistorialResponseDto } from "../types/asistencia.types";
import { formatFecha, formatHora } from "../utils/asistenciaFormatters";
import { AsistenciaStatusBadge } from "./AsistenciaStatusBadge";

interface AsistenciaHistorialListProps {
  asistencias: AsistenciaHistorialResponseDto[];
}

export function AsistenciaHistorialList({
  asistencias,
}: AsistenciaHistorialListProps) {
  return (
    <>
      <Card className="hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
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
                <TableCell className="font-semibold">
                  {formatFecha(asistencia.fecha)}
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
                    <Link to={`/mis-asistencias/${asistencia.id}`}>
                      Ver detalle
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="space-y-3 md:hidden">
        {asistencias.map((asistencia) => (
          <Card key={asistencia.id}>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold text-foreground">
                  {formatFecha(asistencia.fecha)}
                </span>
                <AsistenciaStatusBadge estado={asistencia.estado} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 shrink-0 text-foreground-muted" />
                  <span>{asistencia.obra.nombre}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Users className="size-4 shrink-0" />
                  <span>{asistencia.cuadrilla}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground-muted">
                  <Clock3 className="size-4 shrink-0" />
                  <span>
                    {formatHora(asistencia.fechaHoraIngreso)} —{" "}
                    {formatHora(asistencia.fechaHoraEgreso)}
                  </span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/mis-asistencias/${asistencia.id}`}>
                  Ver detalle
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
