import { useState } from "react";
import { axiosClient } from "@/api/axiosClient";

export default function DashboardPage() {
    const [mensaje, setMensaje] = useState<string>("");

    const consultarRutaAdmin = async () => {
        try {
            const response = await axiosClient.get<string>("/api/usuario/hi");
            setMensaje(response.data);
        } catch (error) {
            console.error("Error al consultar ruta:", error);
        }
    };

    return (
        <div className="p-6">
            <button
                onClick={consultarRutaAdmin}
                className="rounded bg-[#0036a4] px-4 py-2 text-white"
            >
                Probar /api/usuario/hi
            </button>
            {mensaje && <p className="mt-3 font-semibold text-green-700">{mensaje}</p>}
        </div>
    );
}