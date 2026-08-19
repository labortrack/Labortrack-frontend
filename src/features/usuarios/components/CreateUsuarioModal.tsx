import { useState, type FormEvent, useEffect } from "react";
import { usuarioApi } from "../api/usuarioApi";
import type { CreateUsuarioRequestDto, RolNombre } from "../types/usuario.types";
import { X, UserPlus, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface CreateUsuarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const INITIAL_FORM: CreateUsuarioRequestDto = {
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    rol: "ROLE_OPERARIO",
};

export default function CreateUsuarioModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateUsuarioModalProps) {
    const [form, setForm] = useState<CreateUsuarioRequestDto>(INITIAL_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setForm(INITIAL_FORM);
            setErrorMessage(null);
            setShowPassword(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim() || !form.password?.trim()) {
            setErrorMessage("Por favor, completa todos los campos obligatorios.");
            return;
        }

        setIsSubmitting(true);
        try {
            await usuarioApi.create(form);
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Error al crear el usuario. Verifique los datos ingresados.";
            setErrorMessage(typeof msg === "string" ? msg : "Error al registrar usuario.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Card Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 sm:p-8 z-10">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0036a4] flex items-center justify-center text-white shadow-xs">
                            <UserPlus className="w-5 h-5 stroke-[1.75]" />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-bold text-[#1c1b1b]">Nuevo Usuario</h2>
                            <p className="text-[12px] text-[#636363]">Registrar un nuevo acceso al sistema</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-[#636363] hover:text-[#1c1b1b] hover:bg-[#f0eded] rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Alert */}
                {errorMessage && (
                    <div className="mb-4 rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] p-3 text-[13px] font-semibold text-[#93000a] flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                placeholder="Ej. Juan"
                                className="w-full h-10 px-3.5 text-[14px] text-[#1c1b1b] bg-white rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors"
                            />
                        </div>

                        {/* Apellido */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                                Apellido *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.apellido}
                                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                                placeholder="Ej. Pérez"
                                className="w-full h-10 px-3.5 text-[14px] text-[#1c1b1b] bg-white rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Correo Electrónico *
                        </label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="juan.perez@labortrack.com"
                            className="w-full h-10 px-3.5 text-[14px] text-[#1c1b1b] bg-white rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors"
                        />
                    </div>

                    {/* Contraseña */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Contraseña Temporal *
                        </label>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full h-10 pl-3.5 pr-10 text-[14px] text-[#1c1b1b] bg-white rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 text-[#757575] hover:text-[#0036a4] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Rol */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Rol del Sistema *
                        </label>
                        <select
                            value={form.rol}
                            onChange={(e) => setForm({ ...form, rol: e.target.value as RolNombre })}
                            className="w-full h-10 px-3 text-[14px] text-[#1c1b1b] bg-white rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors cursor-pointer"
                        >
                            <option value="ROLE_OPERARIO">Operario</option>
                            <option value="ROLE_RRHH">Recursos Humanos (RRHH)</option>
                            <option value="ROLE_ADMIN">Administrador</option>
                        </select>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e8e8e8]">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onClose}
                            className="px-4 py-2 text-[13px] font-semibold text-[#636363] hover:text-[#1c1b1b] hover:bg-[#f0eded] rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-5 py-2 text-[13px] font-bold text-white bg-[#0036a4] hover:bg-[#002d8a] rounded-lg transition-colors shadow-xs disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                "Crear Usuario"
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}