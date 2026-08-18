import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAccessTokenInMemory } from "@/api/axiosClient";
import { Loader2 } from "lucide-react";

export default function OAuth2CallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // 1. Guarda el access token en memoria RAM
            setAccessTokenInMemory(token);
            // 2. Redirige a la sección protegida
            navigate("/dashboard", { replace: true });
        } else {
            // Si no llegó token, regresa al login con error
            navigate("/login?error=oauth_failed", { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0036a4]" />
                <p className="text-[14px] font-medium text-[#636363]">
                    Completando inicio de sesión con Google...
                </p>
            </div>
        </div>
    );
}