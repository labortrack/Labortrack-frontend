import { useState, type SyntheticEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import {
    Building2,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Lock,
    Loader2,
    ArrowLeft,
} from "lucide-react";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);

        if (!token) {
            setErrorMessage("El enlace de recuperación es inválido o no contiene un token.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Las contraseñas no coinciden.");
            return;
        }

        setIsSubmitting(true);

        try {
            await authApi.resetPassword({
                token,
                newPassword: password,
            });
            setIsSuccess(true);
        } catch (error: any) {
            const backendMessage =
                error?.response?.data?.message ||
                error?.response?.data ||
                "El enlace es inválido o ha expirado. Por favor solicita uno nuevo.";
            setErrorMessage(typeof backendMessage === "string" ? backendMessage : "Error al restablecer contraseña.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#fcf9f8] flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 sm:p-10">

                {/* Logo */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 bg-[#0036a4] rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <Building2 className="w-8 h-8 text-white stroke-[1.75]" />
                    </div>
                    <h1 className="text-[26px] font-bold tracking-tight text-[#1c1b1b]">
                        LaborTrack
                    </h1>
                    <p className="text-[14px] font-medium text-[#636363] mt-0.5">
                        Control de Personal
                    </p>
                </div>

                {isSuccess ? (
                    <div className="flex flex-col gap-5 text-center">
                        <div className="rounded-lg border border-[#004c28]/20 bg-[#e6f4ee] p-4 flex flex-col items-center gap-2">
                            <CheckCircle2 className="w-8 h-8 text-[#004c28]" />
                            <h2 className="text-[16px] font-bold text-[#004c28]">
                                ¡Contraseña Restablecida!
                            </h2>
                            <p className="text-[13px] text-[#004c28] leading-snug">
                                Tu contraseña ha sido actualizada. Ya podés iniciar sesión con tus nuevas credenciales.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="w-full h-11 bg-[#0036a4] hover:bg-[#002d8a] text-white text-[13px] font-bold tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                        >
                            IR A INICIAR SESIÓN
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="text-center mb-1">
                            <h2 className="text-[18px] font-bold text-[#1c1b1b]">Nueva Contraseña</h2>
                            <p className="text-[13px] text-[#636363] mt-1">
                                Ingresá tu nueva clave para acceder al sistema.
                            </p>
                        </div>

                        {(!token || errorMessage) && (
                            <div className="rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] p-3 text-[13px] font-semibold text-[#93000a] flex items-start gap-2.5">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    {!token
                                        ? "Enlace inválido o token no proporcionado. Por favor, solicitá un nuevo enlace de recuperación."
                                        : errorMessage}
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="new-password"
                                className="text-[11px] font-bold tracking-wider text-[#636363] uppercase"
                            >
                                NUEVA CONTRASEÑA
                            </label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3.5 w-4 h-4 text-[#757575] pointer-events-none" />
                                <input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    disabled={!token || isSubmitting}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrorMessage(null);
                                    }}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full h-11 pl-10 pr-11 text-[14px] text-[#1c1b1b] bg-transparent rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    disabled={!token || isSubmitting}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-[#757575] hover:text-[#0036a4] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#757575]" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="confirm-password"
                                className="text-[11px] font-bold tracking-wider text-[#636363] uppercase"
                            >
                                CONFIRMAR NUEVA CONTRASEÑA
                            </label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3.5 w-4 h-4 text-[#757575] pointer-events-none" />
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    disabled={!token || isSubmitting}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setErrorMessage(null);
                                    }}
                                    placeholder="Repite la nueva contraseña"
                                    className="w-full h-11 pl-10 pr-11 text-[14px] text-[#1c1b1b] bg-transparent rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    disabled={!token || isSubmitting}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 text-[#757575] hover:text-[#0036a4] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#757575]" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!token || isSubmitting}
                            className="w-full h-11 mt-2 bg-[#0036a4] hover:bg-[#002d8a] text-white text-[13px] font-bold tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>ACTUALIZANDO...</span>
                                </>
                            ) : (
                                "RESTABLECER CONTRASEÑA"
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0036a4] hover:underline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver al Inicio de Sesión
                            </Link>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}