import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoutes from "../routes/ProtectedRoutes";
import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import ResetPasswordPage from "@/features/auth/pages/ResetPasswordPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import UsuariosPage from "@/features/usuarios/pages/UsuarioPages";

// Componente placeholder provisional para módulos en desarrollo
function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-[#e8e8e8] bg-white p-12 text-center shadow-2xs">
      <h2 className="text-[20px] font-bold text-[#1c1b1b]">{title}</h2>
      <p className="mt-1 text-[13px] text-[#636363]">{description}</p>
      <div className="mt-6 inline-flex items-center rounded-md bg-[#f0eded] px-3 py-1.5 text-[11px] font-bold tracking-wider text-[#636363] uppercase">
        Módulo en construcción
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* 2. Rutas Protegidas dentro de MainLayout */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Módulo Usuarios (Completamente funcional) */}
          <Route path="/usuarios" element={<UsuariosPage />} />

          {/* Scaffolding para el resto de los ítems del Aside */}
          <Route
            path="/legajos"
            element={<PlaceholderPage title="Módulo de Legajos" description="Gestión de empleados, documentación y altas/bajas de personal." />}
          />
          <Route
            path="/obras"
            element={<PlaceholderPage title="Módulo de Obras" description="Administración de proyectos de construcción y asignación de cuadrillas." />}
          />
          <Route
            path="/jornadas"
            element={<PlaceholderPage title="Módulo de Jornadas" description="Planificación y registro de jornadas laborales." />}
          />
          <Route
            path="/asistencia"
            element={<PlaceholderPage title="Control de Asistencias" description="Registro biométrico y diario de asistencia en obra." />}
          />
          <Route
            path="/ausencias"
            element={<PlaceholderPage title="Gestión de Ausencias" description="Licencias, partes médicos e inasistencias justificadas." />}
          />
          <Route
            path="/recibos"
            element={<PlaceholderPage title="Recibos de Sueldo" description="Carga, firma digital y consulta de liquidaciones salariales." />}
          />
          <Route
            path="/documentacion"
            element={<PlaceholderPage title="Documentación de Personal" description="Certificados de cobertura ART, aptos médicos y cursos de inducción." />}
          />
          <Route
            path="/ia"
            element={<PlaceholderPage title="LaborTrack IA" description="Asistente inteligente para análisis de convenios y reportes de obra." />}
          />
          <Route
            path="/higiene"
            element={<PlaceholderPage title="Higiene y Seguridad" description="Entrega de EPP, auditorías de seguridad y capacitaciones en obra." />}
          />
          <Route
            path="/mi-empresa"
            element={<PlaceholderPage title="Configuración de la Empresa" description="Datos fiscales, sucursales y parámetros generales." />}
          />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}