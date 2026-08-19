import { useState, useEffect, type FormEvent } from "react";
import { usuarioApi } from "../api/usuarioApi";
import type { UserResponseDto, ModifyUserRequestDto } from "../types/usuario.types";
import { X, UserCheck, Loader2, AlertCircle } from "lucide-react";

interface ModifyUsuarioModalProps {
    isOpen: boolean;
    user: UserResponseDto | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ModifyUsuarioModal({
    isOpen,
    user,
    onClose,
    onSuccess,
}: ModifyUsuarioModalProps) {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (user && isOpen) {
            setNombre(user.nombre);
            setApellido(user.apellido);
            setErrorMessage(null);
        }
    }, [user, isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!nombre.trim() || !apellido.trim()) {
            setErrorMessage("El nombre y el apellido son obligatorios.");
            return;
        }

        setIsSubmitting(true);
        try {
            const dto: ModifyUserRequestDto = { nombre, apellido };
            await usuarioApi.modify(user.idUsuario, dto);
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Error al modificar el usuario.";
            setErrorMessage(typeof msg === "string" ? msg : "Error al actualizar los datos.");
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
            <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 sm:p-8 z-10">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0036a4] flex items-center justify-center text-white shadow-xs">
                            <UserCheck className="w-5 h-5 stroke-[1.75]" />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-bold text-[#1c1b1b]">Modificar Usuario</h2>
                            <p className="text-[12px] text-[#636363]">ID #{user.idUsuario}</p>
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

                {/* Info no editable */}
                <div className="mb-4 p-3 bg-[#f7f7f8] rounded-lg border border-[#e8e8e8] text-[12px] flex flex-col gap-1">
                    <span className="text-[#636363]">
                        Correo: <strong className="text-[#1c1b1b]">{user.email}</strong>
                    </span>
                    <span className="text-[#636363]">
                        Rol asignado: <strong className="text-[#0036a4]">{user.rol}</strong>
                    </span>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            required
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full h-10 px-3.5 text-[14px] text-[#1c1b1b] bg-white rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Apellido *
                        </label>
                        <input
                            type="text"
                            required
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            className="w-full h-10 px-3.5 text-[14px] text-[#1c1b1b] bg-white rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors"
                        />
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
                                "Guardar Cambios"
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}