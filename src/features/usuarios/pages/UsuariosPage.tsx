import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Edit2,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import {
  CreateUserDialog,
  DeactivateUserDialog,
  EditUserDialog,
} from "../components/UserDialogs";
import { useUsuarios } from "../hooks/useUsuarios";
import type {
  RolNombre,
  UserResponseDto,
  UsuarioFilterDto,
} from "../types/usuario.types";
import type { UserFiltersForm } from "../schemas/usuarioSchemas";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  SearchInput,
} from "@/shared/components";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { normalizeApiError } from "@/shared/lib/http/apiError";

const roleLabels: Record<RolNombre, string> = {
  ROLE_ADMIN: "Administrador",
  ROLE_RRHH: "Recursos Humanos",
  ROLE_OPERARIO: "Operario",
};
const roleVariants: Record<RolNombre, "primary" | "warning" | "success"> = {
  ROLE_ADMIN: "primary",
  ROLE_RRHH: "warning",
  ROLE_OPERARIO: "success",
};
const defaultFilters: UserFiltersForm = {
  nombre: "",
  apellido: "",
  email: "",
  rol: "",
};

export default function UsuariosPage() {
  const [filters, setFilters] = useState<UsuarioFilterDto>({});
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);
  const [deactivatingUser, setDeactivatingUser] =
    useState<UserResponseDto | null>(null);
  const { register, control, handleSubmit, reset } = useForm<UserFiltersForm>({
    defaultValues: defaultFilters,
  });
  const usersQuery = useUsuarios(filters, page);

  const applyFilters = handleSubmit((values) => {
    setFilters({
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      email: values.email.trim(),
      rol: values.rol,
    });
    setPage(0);
  });

  const clearFilters = () => {
    reset(defaultFilters);
    setFilters({});
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de usuarios"
        description="Administración de accesos y roles del sistema LaborTrack."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Nuevo usuario
          </Button>
        }
      />
      <Card>
        <CardContent>
          <form
            onSubmit={applyFilters}
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr_1fr_auto]"
            noValidate
          >
            <SearchInput
              placeholder="Buscar por nombre..."
              aria-label="Buscar por nombre"
              {...register("nombre")}
            />
            <SearchInput
              placeholder="Buscar por apellido..."
              aria-label="Buscar por apellido"
              {...register("apellido")}
            />
            <SearchInput
              placeholder="Buscar por correo..."
              aria-label="Buscar por correo"
              {...register("email")}
            />
            <Controller
              control={control}
              name="rol"
              render={({ field }) => (
                <Select
                  value={field.value || "ALL"}
                  onValueChange={(value) =>
                    field.onChange(value === "ALL" ? "" : value)
                  }
                >
                  <SelectTrigger aria-label="Filtrar por rol">
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los roles</SelectItem>
                    <SelectItem value="ROLE_ADMIN">Administrador</SelectItem>
                    <SelectItem value="ROLE_RRHH">Recursos Humanos</SelectItem>
                    <SelectItem value="ROLE_OPERARIO">Operario</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Search />
                Buscar
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearFilters}
                    aria-label="Limpiar filtros"
                  >
                    <RotateCcw />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Limpiar filtros</TooltipContent>
              </Tooltip>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Users className="size-5 text-primary" />
          <h2 className="font-semibold">Usuarios registrados</h2>
          {usersQuery.data ? (
            <Badge>{usersQuery.data.totalElements}</Badge>
          ) : null}
          {usersQuery.isFetching && !usersQuery.isPending ? (
            <span className="ml-auto text-xs text-foreground-muted">
              Actualizando...
            </span>
          ) : null}
        </div>
        {usersQuery.isPending ? (
          <LoadingState label="Cargando usuarios..." />
        ) : usersQuery.isError ? (
          <ErrorState
            message={
              normalizeApiError(
                usersQuery.error,
                "No se pudieron obtener los usuarios.",
              ).message
            }
            onRetry={() => void usersQuery.refetch()}
          />
        ) : !usersQuery.data?.content.length ? (
          <EmptyState
            title="No se encontraron usuarios"
            description="Probá cambiando o limpiando los filtros de búsqueda."
            action={
              <Button variant="outline" onClick={clearFilters}>
                <Filter />
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre completo</TableHead>
                  <TableHead>Correo electrónico</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.data.content.map((user) => (
                  <TableRow key={user.idUsuario}>
                    <TableCell className="font-mono text-xs text-foreground-muted">
                      #{user.idUsuario}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {user.nombre} {user.apellido}
                    </TableCell>
                    <TableCell className="text-foreground-muted">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleVariants[user.rol]}>
                        {roleLabels[user.rol]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => setEditingUser(user)}
                              aria-label={`Modificar a ${user.nombre} ${user.apellido}`}
                            >
                              <Edit2 />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Modificar usuario</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-error-soft hover:text-error"
                              onClick={() => setDeactivatingUser(user)}
                              aria-label={`Dar de baja a ${user.nombre} ${user.apellido}`}
                            >
                              <Trash2 />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Dar de baja</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={usersQuery.data.number}
              totalPages={usersQuery.data.totalPages}
              totalElements={usersQuery.data.totalElements}
              disabled={usersQuery.isFetching}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog
        key={editingUser?.idUsuario ?? "edit-user"}
        user={editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      />
      <DeactivateUserDialog
        key={deactivatingUser?.idUsuario ?? "deactivate-user"}
        user={deactivatingUser}
        onOpenChange={(open) => {
          if (!open) setDeactivatingUser(null);
        }}
      />
    </div>
  );
}
