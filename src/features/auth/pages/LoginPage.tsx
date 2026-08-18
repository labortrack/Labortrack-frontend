import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
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
    const { login, loginWithGoogle } = useAuth();

    const [view, setView] = useState<"login" | "recovery">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [hasLoginError, setHasLoginError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [recoverySuccess, setRecoverySuccess] = useState(false);

    // Manejador del popup de Google
    async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
        if (!credentialResponse.credential) {
            setHasLoginError(true);
            return;
        }

        setIsSubmitting(true);
        setHasLoginError(false);

        try {
            if (loginWithGoogle) {
                await loginWithGoogle(credentialResponse.credential);
            }
            navigate("/dashboard");
        } catch {
            setHasLoginError(true);
        } finally {
            setIsSubmitting(false);
        }
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

                        {/* Componente Oficial de Google */}
                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setHasLoginError(true)}
                                text="continue_with"
                                shape="rectangular"
                                width="350"
                            />
                        </div>

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