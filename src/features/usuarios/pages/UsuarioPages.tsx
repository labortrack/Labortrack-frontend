import { useState, useEffect, useCallback } from "react";
import { usuarioApi } from "../api/usuarioApi";
import type {
    UserResponseDto,
    UsuarioFilterDto,
    RolNombre,
    SpringPage,
} from "../types/usuario.types";
import CreateUsuarioModal from "../components/CreateUsuarioModal";
import ModifyUsuarioModal from "../components/ModifyUsuarioModal";
import BajaUsuarioModal from "../components/BajaUsuarioModal";
import {
    Users,
    UserPlus,
    Search,
    RefreshCw,
    Edit2,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Shield,
    Filter,
    XCircle,
} from "lucide-react";

export default function UsuariosPage() {
    // Estado de datos y paginación
    const [pageData, setPageData] = useState<SpringPage<UserResponseDto> | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize] = useState<number>(10);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Filtros de búsqueda
    const [filters, setFilters] = useState<UsuarioFilterDto>({
        nombre: "",
        apellido: "",
        email: "",
        rol: "",
    });

    // Estados para modales
    const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);
    const [bajaUser, setBajaUser] = useState<UserResponseDto | null>(null);

    // Función para consultar usuarios con filtros y paginación
    const fetchUsuarios = useCallback(async (page: number = 0) => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const data = await usuarioApi.findByFilter(filters, {
                page,
                size: pageSize,
                sort: "apellido,asc",
            });
            setPageData(data);
            setCurrentPage(data.number);
        } catch (err: any) {
            console.error("Error al cargar usuarios:", err);
            setFetchError("No se pudieron obtener los usuarios. Verifique su conexión o permisos.");
        } finally {
            setIsLoading(false);
        }
    }, [filters, pageSize]);

    // Carga inicial y recarga al cambiar página
    useEffect(() => {
        fetchUsuarios(currentPage);
    }, [fetchUsuarios, currentPage]);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchUsuarios(0);
    };

    const handleResetFilters = () => {
        setFilters({
            nombre: "",
            apellido: "",
            email: "",
            rol: "",
        });
        setCurrentPage(0);
    };

    const renderRolBadge = (rol: RolNombre) => {
        switch (rol) {
            case "ROLE_ADMIN":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#e6f0fa] text-[#0036a4] border border-[#0036a4]/20">
                        <Shield className="w-3 h-3" />
                        ADMINISTRADOR
                    </span>
                );
            case "ROLE_RRHH":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#fef3e7] text-[#fd942e] border border-[#fd942e]/30">
                        <Users className="w-3 h-3" />
                        RECURSOS HUMANOS
                    </span>
                );
            case "ROLE_OPERARIO":
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#e6f4ee] text-[#004c28] border border-[#004c28]/20">
                        OPERARIO
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">

            {/* 1. Header de Sección */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-[24px] font-bold tracking-tight text-[#1c1b1b]">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-[13px] font-medium text-[#636363] mt-0.5">
                        Administración de accesos y roles del sistema LaborTrack
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0036a4] hover:bg-[#002d8a] text-white text-[13px] font-bold tracking-wide rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                    <UserPlus className="w-4 h-4" />
                    NUEVO USUARIO
                </button>
            </div>

            {/* 2. Barra de Filtros */}
            <div className="bg-white rounded-xl border border-[#e8e8e8] p-4 shadow-2xs">
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">

                    {/* Filtro Nombre */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Nombre
                        </label>
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-3.5 h-3.5 text-[#757575] pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                value={filters.nombre || ""}
                                onChange={(e) => setFilters({ ...filters, nombre: e.target.value })}
                                className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfb] rounded-md border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Filtro Apellido */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Apellido
                        </label>
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-3.5 h-3.5 text-[#757575] pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Buscar por apellido..."
                                value={filters.apellido || ""}
                                onChange={(e) => setFilters({ ...filters, apellido: e.target.value })}
                                className="w-full h-9 pl-9 pr-3 text-[13px] bg-[#fbfbfb] rounded-md border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Filtro Rol */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Rol
                        </label>
                        <select
                            value={filters.rol || ""}
                            onChange={(e) => setFilters({ ...filters, rol: e.target.value as RolNombre | "" })}
                            className="w-full h-9 px-3 text-[13px] bg-[#fbfbfb] rounded-md border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] transition-colors cursor-pointer"
                        >
                            <option value="">Todos los roles</option>
                            <option value="ROLE_ADMIN">Administrador</option>
                            <option value="ROLE_RRHH">Recursos Humanos</option>
                            <option value="ROLE_OPERARIO">Operario</option>
                        </select>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 bg-[#0036a4] hover:bg-[#002d8a] text-white text-[12px] font-bold rounded-md transition-colors shadow-2xs cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filtrar
                        </button>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="h-9 px-3 text-[12px] font-semibold text-[#636363] hover:text-[#1c1b1b] hover:bg-[#f0eded] rounded-md transition-colors cursor-pointer"
                        >
                            Limpiar
                        </button>
                    </div>

                </form>
            </div>

            {/* 3. Tabla Principal */}
            <section className="bg-white rounded-xl border border-[#e8e8e8] shadow-2xs overflow-hidden">

                {/* Cabecera de la tabla */}
                <div className="flex items-center justify-between border-b border-[#e8e8e8] p-4 sm:p-5">
                    <div className="flex items-center gap-2.5">
                        <Users className="w-5 h-5 text-[#0036a4]" />
                        <h2 className="text-[16px] font-bold text-[#1c1b1b]">
                            Usuarios Registrados
                        </h2>
                        {pageData && (
                            <span className="ml-2 rounded-full bg-[#f0eded] px-2.5 py-0.5 text-[11px] font-bold text-[#636363]">
                                {pageData.totalElements} en total
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => fetchUsuarios(currentPage)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold text-[#0036a4] hover:bg-[#f0eded] transition-colors disabled:opacity-50 cursor-pointer"
                        title="Refrescar lista"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        Actualizar
                    </button>
                </div>

                {/* Estados de Carga / Error / Tabla */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-[#636363]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0036a4]" />
                        <p className="mt-3 text-[13px] font-medium">Cargando usuarios...</p>
                    </div>
                ) : fetchError ? (
                    <div className="p-12 text-center text-[#ba1a1a]">
                        <XCircle className="mx-auto w-8 h-8 mb-2" />
                        <p className="text-[14px] font-semibold">{fetchError}</p>
                    </div>
                ) : !pageData || pageData.content.length === 0 ? (
                    <div className="p-12 text-center text-[13px] text-[#636363]">
                        No se encontraron usuarios que coincidan con los criterios de búsqueda.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                            <thead className="border-b border-[#e8e8e8] bg-[#fbfbfb] text-[11px] font-bold uppercase tracking-wider text-[#636363]">
                                <tr>
                                    <th className="px-5 py-3.5">ID</th>
                                    <th className="px-5 py-3.5">Nombre Completo</th>
                                    <th className="px-5 py-3.5">Correo Electrónico</th>
                                    <th className="px-5 py-3.5">Rol</th>
                                    <th className="px-5 py-3.5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e8e8e8]">
                                {pageData.content.map((user) => (
                                    <tr key={user.idUsuario} className="hover:bg-[#fafafa] transition-colors">

                                        {/* ID */}
                                        <td className="px-5 py-4 font-mono text-[12px] text-[#636363]">
                                            #{user.idUsuario}
                                        </td>

                                        {/* Nombre y Apellido */}
                                        <td className="px-5 py-4 font-semibold text-[#1c1b1b]">
                                            {user.nombre} {user.apellido}
                                        </td>

                                        {/* Email */}
                                        <td className="px-5 py-4 text-[#636363] font-medium">
                                            {user.email}
                                        </td>

                                        {/* Rol */}
                                        <td className="px-5 py-4">
                                            {renderRolBadge(user.rol)}
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                {/* Botón Editar */}
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-1.5 text-[#636363] hover:text-[#0036a4] hover:bg-[#e6f0fa] rounded-md transition-colors cursor-pointer"
                                                    title="Modificar Nombre y Apellido"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>

                                                {/* Botón Dar de Baja */}
                                                <button
                                                    type="button"
                                                    onClick={() => setBajaUser(user)}
                                                    className="p-1.5 text-[#636363] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded-md transition-colors cursor-pointer"
                                                    title="Dar de baja usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 4. Footer de Paginación */}
                {pageData && pageData.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-[#e8e8e8] px-5 py-3.5 bg-[#fbfbfb]">
                        <p className="text-[12px] text-[#636363]">
                            Página <strong className="text-[#1c1b1b]">{pageData.number + 1}</strong> de{" "}
                            <strong className="text-[#1c1b1b]">{pageData.totalPages}</strong>
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={pageData.first || isLoading}
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-[#1c1b1b] bg-white border border-[#cfd1d4] rounded-md hover:bg-[#f0eded] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Anterior
                            </button>

                            <button
                                type="button"
                                disabled={pageData.last || isLoading}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-semibold text-[#1c1b1b] bg-white border border-[#cfd1d4] rounded-md hover:bg-[#f0eded] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                            >
                                Siguiente
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

            </section>

            {/* 5. Modales de Acción */}
            <CreateUsuarioModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => fetchUsuarios(currentPage)}
            />

            <ModifyUsuarioModal
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={() => fetchUsuarios(currentPage)}
            />

            <BajaUsuarioModal
                isOpen={!!bajaUser}
                user={bajaUser}
                onClose={() => setBajaUser(null)}
                onSuccess={() => fetchUsuarios(currentPage)}
            />

        </div>
    );
}