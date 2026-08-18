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

    const [view, setView] = useState<"login" | "recovery">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [hasLoginError, setHasLoginError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoverySuccess, setRecoverySuccess] = useState(false);

    // Redirección directa al endpoint de Spring Security OAuth2
    function handleGoogleLogin() {
        const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
        window.location.href = `${backendUrl}/oauth2/authorization/google`;
    }

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
        <div className="min-h-screen w-full bg-[#fcf9f8] flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 sm:p-10">

                {/* Cabecera / Logo */}
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

                {view === "login" ? (
                    <div className="flex flex-col gap-5">

                        {/* Botón de Google OAuth2 */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full h-11 border border-[#cfd1d4] hover:bg-[#f7f7f8] text-[#1c1b1b] text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-3 shadow-xs"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                            <span>Continuar con Google</span>
                        </button>

                        {/* Separador */}
                        <div className="relative flex items-center justify-center">
                            <div className="border-t border-[#e8e8e8] w-full" />
                            <span className="bg-white px-3 text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wider absolute">
                                o
                            </span>
                        </div>

                        {/* FORMULARIO DE LOGIN TRADICIONAL */}
                        <form onSubmit={handleLogin} className="flex flex-col gap-5">
                            {hasLoginError && (
                                <div className="rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] p-3 text-[13px] font-semibold text-[#93000a] text-center">
                                    El correo electrónico o la contraseña son incorrectos.
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="email"
                                    className="text-[11px] font-bold tracking-wider text-[#636363] uppercase"
                                >
                                    CORREO ELECTRÓNICO
                                </label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3.5 w-4 h-4 text-[#757575] pointer-events-none" />
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
                                        className={`w-full h-11 pl-10 pr-4 text-[14px] text-[#1c1b1b] bg-transparent rounded-lg border ${hasLoginError ? "border-[#ba1a1a]" : "border-[#cfd1d4]"
                                            } focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors`}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="password"
                                    className="text-[11px] font-bold tracking-wider text-[#636363] uppercase"
                                >
                                    CONTRASEÑA
                                </label>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3.5 w-4 h-4 text-[#757575] pointer-events-none" />
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
                                        className={`w-full h-11 pl-10 pr-11 text-[14px] text-[#1c1b1b] bg-transparent rounded-lg border ${hasLoginError ? "border-[#ba1a1a]" : "border-[#cfd1d4]"
                                            } focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4] transition-colors`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 text-[#757575] hover:text-[#0036a4] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#757575]" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end -mt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setView("recovery");
                                        setHasLoginError(false);
                                        setRecoverySuccess(false);
                                    }}
                                    disabled={isSubmitting}
                                    className="text-[13px] font-semibold text-[#0036a4] hover:underline"
                                >
                                    ¿Olvidó su contraseña?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 mt-1 bg-[#0036a4] hover:bg-[#002d8a] text-white text-[13px] font-bold tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>INGRESANDO...</span>
                                    </>
                                ) : (
                                    "INICIAR SESIÓN"
                                )}
                            </button>
                        </form>

                        <div className="border-t border-[#f0f0f0] pt-4">
                            <p className="text-[11px] leading-relaxed text-[#757575] text-center">
                                El acto de ingresar y operar en la plataforma constituye la aceptación total de los Términos y Condiciones de LaborTrack.
                            </p>
                        </div>

                    </div>
                ) : (
                    /* FORMULARIO DE RECUPERACIÓN */
                    <form onSubmit={handleRecovery} className="flex flex-col gap-5">
                        {recoverySuccess ? (
                            <div className="rounded-lg border border-[#004c28]/20 bg-[#e6f4ee] p-4 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#004c28] flex-shrink-0 mt-0.5" />
                                <p className="text-[13px] font-medium text-[#004c28] leading-snug">
                                    Si el correo está registrado, se han enviado las instrucciones para restablecer su contraseña.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-1">
                                    <h2 className="text-[18px] font-bold text-[#1c1b1b]">Restablecer Contraseña</h2>
                                    <p className="text-[13px] text-[#636363] mt-1">
                                        Ingrese su correo electrónico para recibir las instrucciones de recuperación.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="recovery-email" className="text-[11px] font-bold tracking-wider text-[#636363] uppercase">
                                        CORREO ELECTRÓNICO DE LEGAJO
                                    </label>
                                    <div className="relative flex items-center">
                                        <Mail className="absolute left-3.5 w-4 h-4 text-[#757575] pointer-events-none" />
                                        <input
                                            id="recovery-email"
                                            type="email"
                                            required
                                            disabled={isSubmitting}
                                            value={recoveryEmail}
                                            onChange={(e) => setRecoveryEmail(e.target.value)}
                                            placeholder="email@labortrack.com"
                                            className="w-full h-11 pl-10 pr-4 text-[14px] text-[#1c1b1b] bg-transparent rounded-lg border border-[#cfd1d4] focus:outline-none focus:border-[#0036a4] focus:ring-1 focus:ring-[#0036a4]"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 bg-[#0036a4] hover:bg-[#002d8a] text-white text-[13px] font-bold tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isSubmitting ? "ENVIANDO..." : "ENVIAR INSTRUCCIONES"}
                                </button>
                            </>
                        )}

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => setView("login")}
                                className="text-[13px] font-semibold text-[#0036a4] hover:underline"
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