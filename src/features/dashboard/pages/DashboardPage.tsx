import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { axiosClient } from "../../../api/axiosClient";
import {
    Building2,
    CheckCircle2,
    Loader2,
    LogOut,
    RefreshCw,
    ShieldCheck,
    User,
    Users,
    XCircle,
} from "lucide-react";

interface Usuario {
    idUsuario: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
}

export default function DashboardPage() {
    const { email: currentUserEmail, logout } = useAuth();

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [testMessage, setTestMessage] = useState<string>("");
    const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
    const [isTestingHi, setIsTestingHi] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const fetchUsuarios = async () => {
        setIsLoadingUsers(true);
        setFetchError(null);
        try {
            const response = await axiosClient.get<Usuario[]>("/api/usuario");
            setUsuarios(response.data);
        } catch (err) {
            console.error("Error al obtener usuarios:", err);
            setFetchError("No se pudieron cargar los usuarios del sistema.");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleTestHi = async () => {
        setIsTestingHi(true);
        try {
            const response = await axiosClient.get<string>("/api/usuario/hi");
            setTestMessage(response.data);
        } catch (err) {
            console.error("Error en test endpoint:", err);
            setTestMessage("Error al consultar /api/usuario/hi");
        } finally {
            setIsTestingHi(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <div className="min-h-screen bg-[#fcf9f8] p-6 lg:p-10">
            <div className="mx-auto max-w-5xl space-y-6">

                {/* Barra superior */}
                <header className="flex flex-col gap-4 rounded-xl border border-[#e8e8e8] bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0036a4] text-white shadow-xs">
                            <Building2 className="h-6 w-6 stroke-[1.75]" />
                        </div>
                        <div>
                            <h1 className="text-[20px] font-bold tracking-tight text-[#1c1b1b]">
                                LaborTrack · Panel de Control
                            </h1>
                            <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#636363]">
                                <User className="h-3.5 w-3.5" />
                                Sesión: <strong className="text-[#1c1b1b]">{currentUserEmail}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTestHi}
                            disabled={isTestingHi}
                            className="flex items-center gap-2 rounded-lg border border-[#cfd1d4] bg-white px-4 py-2 text-[13px] font-semibold text-[#1c1b1b] transition-colors hover:bg-[#f7f7f8] disabled:opacity-50"
                        >
                            {isTestingHi ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-[#0036a4]" />}
                            Probar /hi
                        </button>

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 rounded-lg bg-[#ba1a1a] px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-[#93000a]"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* Mensaje de prueba /hi */}
                {testMessage && (
                    <div className="flex items-center justify-between rounded-lg border border-[#004c28]/20 bg-[#e6f4ee] px-4 py-3 text-[13px] font-semibold text-[#004c28]">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Respuesta del backend: <strong>{testMessage}</strong></span>
                        </div>
                        <button onClick={() => setTestMessage("")} className="text-xs underline hover:text-[#0036a4]">
                            Descartar
                        </button>
                    </div>
                )}

                {/* Tabla de Usuarios */}
                <section className="rounded-xl border border-[#e8e8e8] bg-white shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between border-b border-[#e8e8e8] p-5">
                        <div className="flex items-center gap-2.5">
                            <Users className="h-5 w-5 text-[#0036a4]" />
                            <h2 className="text-[16px] font-bold text-[#1c1b1b]">
                                Usuarios Registrados
                            </h2>
                            <span className="ml-2 rounded-full bg-[#f0eded] px-2.5 py-0.5 text-[11px] font-bold text-[#636363]">
                                {usuarios.length}
                            </span>
                        </div>

                        <button
                            onClick={fetchUsuarios}
                            disabled={isLoadingUsers}
                            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold text-[#0036a4] hover:bg-[#f0eded] transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                            Actualizar lista
                        </button>
                    </div>

                    {isLoadingUsers ? (
                        <div className="flex flex-col items-center justify-center p-12 text-[#636363]">
                            <Loader2 className="h-7 w-7 animate-spin text-[#0036a4]" />
                            <p className="mt-3 text-[13px] font-medium">Cargando usuarios...</p>
                        </div>
                    ) : fetchError ? (
                        <div className="p-8 text-center text-[#ba1a1a]">
                            <XCircle className="mx-auto h-7 w-7 mb-2" />
                            <p className="text-[14px] font-semibold">{fetchError}</p>
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="p-8 text-center text-[13px] text-[#636363]">
                            No se encontraron usuarios en la base de datos.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[13px]">
                                <thead className="border-b border-[#e8e8e8] bg-[#fbfbfb] text-[11px] font-bold uppercase tracking-wider text-[#636363]">
                                    <tr>
                                        <th className="px-5 py-3">ID</th>
                                        <th className="px-5 py-3">Nombre Completo</th>
                                        <th className="px-5 py-3">Correo Electrónico</th>
                                        <th className="px-5 py-3">Rol</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e8e8e8]">
                                    {usuarios.map((u) => (
                                        <tr key={u.idUsuario} className="hover:bg-[#fafafa] transition-colors">
                                            <td className="px-5 py-3.5 font-mono text-[12px] text-[#636363]">
                                                #{u.idUsuario}
                                            </td>
                                            <td className="px-5 py-3.5 font-semibold text-[#1c1b1b]">
                                                {u.nombre} {u.apellido}
                                            </td>
                                            <td className="px-5 py-3.5 text-[#636363]">
                                                {u.email}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-block rounded-md bg-[#e6f0fa] px-2 py-0.5 font-mono text-[11px] font-bold text-[#0036a4]">
                                                    {u.rol}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}