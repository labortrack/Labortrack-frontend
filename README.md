# LaborTrack Frontend

Frontend web de LaborTrack construido con React, TypeScript, Vite y Tailwind CSS.

## Alcance actual

- Inicio de sesión tradicional y con Google.
- Recuperación y restablecimiento de contraseña.
- Sesión con access token en memoria y refresh token HttpOnly.
- Dashboard inicial vacío.
- Consulta, filtros, paginación, alta, edición y baja lógica de usuarios.
- Acceso a usuarios limitado a `ROLE_ADMIN` y `ROLE_RRHH`.

No se incluyen rutas vacías para módulos todavía no implementados.

## Configuración

Requiere Node.js 20 o superior, pnpm y el backend de LaborTrack. Copiar `.env.example` como `.env.local` y completar:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=LaborTrack
VITE_GOOGLE_CLIENT_ID=
```

`VITE_GOOGLE_CLIENT_ID` puede quedar vacío si no se probará Google OAuth. El origen exacto del frontend debe estar autorizado en el cliente OAuth de Google.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## Arquitectura

```text
src/
├─ app/          # Proveedores, router, configuración y layouts globales
├─ features/     # Módulos funcionales: auth, dashboard y usuarios
├─ shared/       # UI, patrones, utilidades e infraestructura reutilizable
└─ styles/       # Entrada CSS, tokens del sistema y estilos globales
```

Cada feature mantiene juntas sus páginas, API, hooks, esquemas, tipos y componentes. `shared/ui` contiene piezas visuales básicas; `shared/components`, composiciones reutilizables. Los componentes propios de un negocio permanecen en su feature.

## Decisiones técnicas

- Axios centraliza peticiones, errores y un único refresh ante varios `401` simultáneos.
- TanStack Query administra datos remotos, caché, paginación y mutaciones.
- Zustand conserva el estado mínimo de sesión en el cliente.
- React Hook Form y Zod administran formularios y validaciones.
- React Router define rutas públicas, protegidas y autorizadas mediante layouts y guards.
- Los tokens CSS expuestos a Tailwind evitan repetir decisiones visuales en JSX.

Las reglas visuales se documentan en [DESIGN.md](./DESIGN.md).
