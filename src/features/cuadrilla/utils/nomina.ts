import type {
  CuadrillaResponseDto,
  EmpleadoGrupoCuadrillaResponseDto,
} from "../types/cuadrilla.types";

/**
 * Un empleado de la nómina con todas sus asignaciones vigentes en la cuadrilla.
 * El líder tiene dos: una como integrante (grupo de la especialidad) y otra
 * como líder (grupo "Líder de Cuadrilla").
 */
export interface IntegranteNomina {
  empleadoId: number;
  nombreEmpleado: string;
  apellidoEmpleado: string;
  /** Asignaciones como integrante, sin la de líder. */
  asignaciones: EmpleadoGrupoCuadrillaResponseDto[];
  asignacionLider: EmpleadoGrupoCuadrillaResponseDto | null;
  /** Asignación sobre la que se opera (desvincular, historial). */
  principal: EmpleadoGrupoCuadrillaResponseDto;
}

export function agruparNominaPorEmpleado(
  operarios: EmpleadoGrupoCuadrillaResponseDto[],
  cuadrilla: Pick<CuadrillaResponseDto, "lider">,
): IntegranteNomina[] {
  const idAsignacionLider = cuadrilla.lider?.idAsignacion;
  const porEmpleado = new Map<number, IntegranteNomina>();

  for (const op of operarios) {
    const actual = porEmpleado.get(op.empleadoId) ?? {
      empleadoId: op.empleadoId,
      nombreEmpleado: op.nombreEmpleado,
      apellidoEmpleado: op.apellidoEmpleado,
      asignaciones: [],
      asignacionLider: null,
      principal: op,
    };
    if (op.id === idAsignacionLider) actual.asignacionLider = op;
    else actual.asignaciones.push(op);
    actual.principal = actual.asignaciones[0] ?? actual.asignacionLider ?? op;
    porEmpleado.set(op.empleadoId, actual);
  }

  return [...porEmpleado.values()];
}
