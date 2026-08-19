import { useState, useEffect, type FormEvent } from "react";
import { usuarioApi } from "../api/usuarioApi";
import type { UserResponseDto } from "../types/usuario.types";
import { X, AlertTriangle, Loader2, AlertCircle } from "lucide-react";

interface BajaUsuarioModalProps {
    isOpen: boolean;
    user: UserResponseDto | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BajaUsuarioModal({
    isOpen,
    user,
    onClose,
    onSuccess,
}: BajaUsuarioModalProps) {
    const [motivo, setMotivo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setMotivo("");
            setErrorMessage(null);
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!motivo.trim()) {
            setErrorMessage("Debes ingresar un motivo para dar de baja al usuario.");
            return;
        }

        setIsSubmitting(true);
        try {
            await usuarioApi.deleteById(user.idUsuario, { motivo });
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data ||
                "Error al procesar la baja del usuario.";
            setErrorMessage(typeof msg === "string" ? msg : "Error al dar de baja.");
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

                {/* Header con alerta visual */}
                <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a] shadow-xs">
                            <AlertTriangle className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                            <h2 className="text-[18px] font-bold text-[#1c1b1b]">Dar de Baja Usuario</h2>
                            <p className="text-[12px] text-[#636363]">Acción de inhabilitación</p>
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

                <div className="mb-4 text-[13px] text-[#1c1b1b] leading-relaxed">
                    ¿Estás seguro de que deseas dar de baja al usuario{" "}
                    <strong>
                        {user.nombre} {user.apellido}
                    </strong>{" "}
                    (<span className="font-mono text-[12px]">{user.email}</span>)?
                </div>

                {/* Formulario de motivo */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                            Motivo de la baja *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Indica la razón de la baja (ej. Desvinculación, cambio de puesto...)"
                            className="w-full p-3 text-[13px] text-[#1c1b1b] bg-white rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a] transition-colors resize-none"
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
                            className="flex items-center gap-2 px-5 py-2 text-[13px] font-bold text-white bg-[#ba1a1a] hover:bg-[#93000a] rounded-lg transition-colors shadow-xs disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Procesando...</span>
                                </>
                            ) : (
                                "Confirmar Baja"
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}