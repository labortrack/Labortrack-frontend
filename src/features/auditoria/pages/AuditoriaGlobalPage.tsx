import { type FormEvent, useState } from "react";
import { Search, ShieldAlert, Sparkles } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui";
import {
  ErrorState,
  PageHeader,
} from "@/shared/components";
import {
  useEntidadesAuditables,
  formatNombreEntidad,
  HistorialAuditoria,
} from "@/features/auditoria";

export default function AuditoriaGlobalPage() {
  const {
    data: entidades,
    isLoading: loadingEntidades,
    isError: errorEntidades,
    error: errEntidadesObj,
    refetch: refetchEntidades,
  } = useEntidadesAuditables();

  const [selectedEntidad, setSelectedEntidad] = useState<string>("");
  const [inputId, setInputId] = useState<string>("");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [consultaActiva, setConsultaActiva] = useState<{
    entidad: string;
    id: number;
  } | null>(null);

  const handleEntidadChange = (value: string) => {
    setSelectedEntidad(value);
    setErrorValidacion(null);
    // Limpiar el resultado anterior al cambiar de entidad
    setConsultaActiva(null);
  };

  const handleIdChange = (value: string) => {
    setInputId(value);
    setErrorValidacion(null);
    // Limpiar el resultado anterior al cambiar de ID
    setConsultaActiva(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!selectedEntidad) {
      setErrorValidacion("Por favor seleccioná una entidad auditable.");
      return;
    }

    const numId = Number(inputId.trim());
    if (!inputId.trim() || isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
      setErrorValidacion("El ID debe ser un número entero positivo mayor a 0.");
      return;
    }

    setErrorValidacion(null);
    setConsultaActiva({
      entidad: selectedEntidad,
      id: numId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <PageHeader
        title="Historial de Auditoría"
        description="Consulta la trazabilidad completa y los cambios históricos registrados en el sistema."
      />

      {/* Si el endpoint de entidades falla, mostrar ErrorState y deshabilitar formulario */}
      {errorEntidades ? (
        <Card className="border-error/40 bg-card shadow-soft">
          <CardContent className="p-6">
            <ErrorState
              message={
                errEntidadesObj instanceof Error
                  ? errEntidadesObj.message
                  : "No se pudo obtener el listado de entidades auditables desde el backend."
              }
              onRetry={() => refetchEntidades()}
            />
          </CardContent>
        </Card>
      ) : (
        /* Formulario de Búsqueda de Auditoría */
        <Card className="border-border bg-card shadow-soft">
          <CardHeader className="border-b border-border/60 pb-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Search className="size-4 text-primary" />
              Búsqueda de Registro Auditado
            </h3>
            <p className="mt-1 text-xs text-foreground-muted">
              Selecciona una entidad del sistema e ingresa su identificador numérico para explorar sus revisiones.
            </p>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Selector de Entidad */}
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="entidad-select" className="text-xs font-semibold">
                  Entidad
                </Label>
                <Select
                  value={selectedEntidad}
                  onValueChange={handleEntidadChange}
                  disabled={loadingEntidades}
                >
                  <SelectTrigger id="entidad-select" className="w-full">
                    <SelectValue
                      placeholder={
                        loadingEntidades
                          ? "Cargando entidades..."
                          : "Seleccionar entidad..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(entidades ?? []).map((entidadClave) => (
                      <SelectItem key={entidadClave} value={entidadClave}>
                        {formatNombreEntidad(entidadClave)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input Numérico para el ID */}
              <div className="w-full sm:w-48 space-y-1.5">
                <Label htmlFor="id-input" className="text-xs font-semibold">
                  ID del Registro
                </Label>
                <Input
                  id="id-input"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ej: 1"
                  value={inputId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  disabled={loadingEntidades}
                  className="w-full"
                />
              </div>

              {/* Botón de Consulta */}
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loadingEntidades || !selectedEntidad || !inputId}
                  className="w-full sm:w-auto gap-2"
                >
                  <Search className="size-4" />
                  Consultar
                </Button>
              </div>
            </form>

            {/* Mensaje de validación */}
            {errorValidacion && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-error">
                <ShieldAlert className="size-4 shrink-0" />
                {errorValidacion}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Panel de Resultados / Mensaje Inicial */}
      {!errorEntidades && (
        <>
          {consultaActiva ? (
            <Card className="border-border bg-card p-6 shadow-soft">
              <HistorialAuditoria
                entidad={consultaActiva.entidad}
                id={consultaActiva.id}
              />
            </Card>
          ) : (
            <Card className="border-dashed border-border bg-card/50 p-12 text-center shadow-soft">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Sparkles className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Seleccioná una entidad y un ID
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">
                Elegí una entidad auditable e ingresá el identificador numérico de su registro para consultar su historial de cambios.
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
