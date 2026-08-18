import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import {
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Loader2,
} from "lucide-react";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Estados de vista y formulario
    const [view, setView] = useState<"login" | "recovery">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [hasLoginError, setHasLoginError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados de recuperación
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoverySuccess, setRecoverySuccess] = useState(false);

    // 1. Submit Login
    async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email.trim() || !password) return;

        setIsSubmitting(true);
        setHasLoginError(false);

        try {
            await login({ email: email.trim(), password });
            navigate("/dashboard");
        } catch {
            setHasLoginError(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    // 2. Submit Recuperación
    async function handleRecovery(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!recoveryEmail.trim()) return;

        setIsSubmitting(true);

        try {
            await authApi.forgotPassword({ email: recoveryEmail.trim() });
            setRecoverySuccess(true);
        } catch {
            setRecoverySuccess(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#fcf9f8] px-6 py-10 flex items-center justify-center">
            <div className="w-full max-w-[460px] rounded-[0.75rem] border border-[#e8e8e8] bg-white p-8 shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">

                {/* Cabecera común con logo */}
                <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[0.75rem] bg-[#0036a4]">
                        <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-[24px] font-bold tracking-tight text-[#1c1b1b]">LaborTrack</h1>
                    <p className="text-[14px] font-semibold text-[#636363] mt-1">Control de Personal</p>
                </div>

                {view === "login" ? (
                    /* FORMULARIO DE LOGIN */
                    <form onSubmit={handleLogin} className="space-y-5">
                        {hasLoginError && (
                            <div className="rounded-[0.5rem] border border-[#ba1a1a]/30 bg-[#ffdad6] px-4 py-3 text-[13px] font-bold text-[#93000a]">
                                El correo electrónico o la contraseña son incorrectos. Por favor, inténtelo de nuevo.
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-[12px] font-medium text-[#636363]">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#636363]" />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    disabled={isSubmitting}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setHasLoginError(false);
                                    }}
                                    placeholder="ejemplo@labortrack.com"
                                    className={`w-full h-11 pl-10 pr-3 text-[14px] rounded-[0.5rem] border ${hasLoginError ? "border-[#ba1a1a]" : "border-[#d1d5db]"
                                        } focus:outline-none focus:ring-2 focus:ring-[#0036a4]/20 focus:border-[#0036a4]`}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-[12px] font-medium text-[#636363]">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#636363]" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    disabled={isSubmitting}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setHasLoginError(false);
                                    }}
                                    placeholder="••••••••"
                                    className={`w-full h-11 pl-10 pr-10 text-[14px] rounded-[0.5rem] border ${hasLoginError ? "border-[#ba1a1a]" : "border-[#d1d5db]"
                                        } focus:outline-none focus:ring-2 focus:ring-[#0036a4]/20 focus:border-[#0036a4]`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636363] hover:text-[#0036a4]"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setView("recovery");
                                    setHasLoginError(false);
                                    setRecoverySuccess(false);
                                }}
                                disabled={isSubmitting}
                                className="text-[14px] font-semibold text-[#0036a4] hover:underline"
                            >
                                ¿Olvidó su contraseña?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 bg-[#0036a4] hover:bg-[#002d8a] text-white font-semibold rounded-[0.5rem] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                "Iniciar Sesión"
                            )}
                        </button>

                        <p className="border-t border-[#e8e8e8] pt-5 text-center text-[11px] text-[#636363]">
                            El acto de ingresar y operar en la plataforma constituye la aceptación total de los Términos y Condiciones de LaborTrack.
                        </p>
                    </form>
                ) : (
                    /* FORMULARIO DE RECUPERACIÓN */
                    <form onSubmit={handleRecovery} className="space-y-5">
                        {recoverySuccess ? (
                            <div className="rounded-[0.5rem] border border-[#004c28]/30 bg-[#e6f4ee] p-4 flex gap-3">
                                <CheckCircle2 className="h-5 w-5 text-[#004c28] flex-shrink-0" />
                                <p className="text-[13px] font-semibold text-[#004c28]">
                                    Si el correo está registrado, se han enviado las instrucciones para restablecer su contraseña.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-2">
                                    <h2 className="text-[18px] font-bold text-[#1c1b1b]">Restablecer Contraseña</h2>
                                    <p className="text-[13px] text-[#636363] mt-1">
                                        Ingrese su correo electrónico para recibir las instrucciones de recuperación.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="recovery-email" className="block text-[12px] font-medium text-[#636363]">
                                        Correo Electrónico de Legajo
                                    </label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#636363]" />
                                        <input
                                            id="recovery-email"
                                            type="email"
                                            required
                                            disabled={isSubmitting}
                                            value={recoveryEmail}
                                            onChange={(e) => setRecoveryEmail(e.target.value)}
                                            placeholder="email@labortrack.com"
                                            className="w-full h-11 pl-10 pr-3 text-[14px] rounded-[0.5rem] border border-[#d1d5db] focus:outline-none focus:ring-2 focus:ring-[#0036a4]/20 focus:border-[#0036a4]"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 bg-[#0036a4] hover:bg-[#002d8a] text-white font-semibold rounded-[0.5rem] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isSubmitting ? "Enviando..." : "Enviar Instrucciones"}
                                </button>
                            </>
                        )}

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => setView("login")}
                                className="text-[14px] font-semibold text-[#0036a4] hover:underline"
                            >
                                ← Volver al Inicio de Sesión
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}