# Relevamiento y Resumen Técnico: Módulo de Legajos (Frontend)

Este documento contiene el resumen detallado de la arquitectura, tipos de datos, DTOs, endpoints de API, hooks, componentes y datos de prueba (Mock) del módulo de **Legajos Digitales** (`src/features/legajos`).

---

## 1. Explicación: ¿Por qué aparecían datos Mock / Empleados estáticos?

En el archivo [`legajosApi.ts`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/api/legajosApi.ts), las funciones de consulta (`getPaginados`, `getDetalle` y `getHistorialEstados`) fueron implementadas con un bloque `try...catch` de contingencia/desarrollo local:

```ts
// Ejemplo en getPaginados
try {
  const response = await httpClient.get<SpringPage<EmpleadoResumenResponseDto>>('/EmpleadosPaginados', { params: queryParams });
  return response.data;
} catch {
  // FALLBACK LOCAL: Si falla la petición HTTP al backend, devuelve la lista mock
  return filterAndPaginateMock(params);
}
```

### Causa principal
Si el backend no está corriendo, o si los endpoints del backend tienen una URL o estructura de respuesta distinta (por ejemplo, error 404, CORS, 401 por falta de token JWT o 500), el bloque `catch` atrapa el error silenciosamente y devuelve la información estática del arreglo `MOCK_EMPLEADOS_DETALLE` (con datos ficticios como *Carlos Eduardo Álvarez*, *Roberto Martín Benítez*, etc.).

---

## 2. Tipos de Datos y DTOs Definidos (`legajo.types.ts`)

Ubicación: [`src/features/legajos/types/legajo.types.ts`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/types/legajo.types.ts)

### Enums / Tipos Auxiliares
* **`Genero`**: `"MASCULINO" | "FEMENINO" | "OTRO"`
* **`CATEGORIA_LABELS`**:
  * `OFICIAL_ESPECIALIZADO`: "Oficial Especializado"
  * `OFICIAL`: "Oficial"
  * `MEDIO_OFICIAL`: "Medio Oficial"
  * `PEON`: "Peón"
  * `AYUDANTE`: "Ayudante"
* **`ESTADO_LABELS`**:
  * `ACTIVO`: "Activo"
  * `EN_OBRA`: "En Obra"
  * `INACTIVO`: "Inactivo"
  * `SUSPENDIDO`: "Suspendido"
  * `LICENCIA`: "Licencia"

### DTOs de Solicitud (Requests)
1. **`CreateUsuarioRequestDto`** (Creación del usuario ligado al legajo):
   * `nombre`: `string`
   * `apellido`: `string`
   * `email`: `string`
   * `password?`: `string`
   * `rol?`: `string`

2. **`EmpleadoDto`** (Alta completa de empleado):
   * `dni`: `string`
   * `cuil`: `string`
   * `fechaNacimiento`: `string` (YYYY-MM-DD)
   * `nacionalidad`: `string`
   * `grupoSanguineo`: `string`
   * `domicilio`: `string`
   * `numeroCelular`: `string`
   * `nombreContactoEmergencia`: `string`
   * `celularContactoEmergencia`: `string`
   * `numeroIeric`: `string`
   * `fechaIngreso`: `string` (YYYY-MM-DD)
   * `genero`: `Genero`
   * `usuario`: `CreateUsuarioRequestDto`

3. **`EmpleadoUpdateDto`** (Modificación de legajo):
   * `nacionalidad?`: `string`
   * `domicilio?`: `string`
   * `numeroCelular?`: `string`
   * `nombreContactoEmergencia?`: `string`
   * `celularContactoEmergencia?`: `string`
   * `categoriaUocraId?`: `number`

4. **`EmpleadoBajaDto`** (Baja de empleado):
   * `fechaBaja`: `string` (YYYY-MM-DD)
   * `motivo`: `string`

5. **`ReactivarLegajoRequestDto`** (Reactivación de legajo):
   * `motivo`: `string`

### DTOs de Respuesta (Responses)
1. **`EmpleadoResumenResponseDto`** (Vista simplificada para la grilla/tabla):
   * `id`: `number`
   * `apellido`: `string`
   * `nombre`: `string`
   * `dni`: `string`
   * `cuil`: `string`
   * `numeroIeric`: `string`
   * `email`: `string`
   * `numeroCelular`: `string`
   * `categoriaActual`: `string`
   * `estadoActual`: `string`
   * `fotoPerfilKey`: `string`
   * `fechaIngreso`: `string`

2. **`EmpleadoResponseDto`** (Vista completa 360°):
   * `id`: `number`
   * `apellido`: `string`
   * `nombre`: `string`
   * `cuil`: `string`
   * `dni`: `string`
   * `numeroIeric`: `string`
   * `fechaNacimiento`: `string`
   * `fechaIngreso`: `string`
   * `email`: `string`
   * `grupoSanguineo`: `string`
   * `nacionalidad`: `string`
   * `domicilio`: `string`
   * `numeroCelular`: `string`
   * `nombreContactoEmergencia`: `string`
   * `celularContactoEmergencia`: `string`
   * `genero`: `Genero`
   * `fotoPerfilKey`: `string`
   * `estadoActual`: `string`
   * `categoriaActual`: `string`

3. **`EmpleadoEstadoResponseDto`** (Historial de estados):
   * `id`: `number`
   * `nombreEstado`: `string`
   * `fechaDesde`: `string`
   * `fechaHasta`: `string | null`
   * `motivo`: `string`

4. **`SpringPage<T>`** (Envoltorio genérico de paginación de Spring Boot):
   * `content`: `T[]`
   * `totalElements`: `number`
   * `totalPages`: `number`
   * `size`: `number`
   * `number`: `number` (0-indexed)

5. **`EmpleadoFilterParams`**:
   * `buscar?`: `string` (búsqueda por DNI, Nombre, Apellido, CUIL, IERIC)
   * `estado?`: `string`
   * `categoria?`: `string`
   * `page?`: `number`
   * `size?`: `number`
   * `sort?`: `string`

---

## 3. Endpoints HTTP Configurados (`legajosApi.ts`)

Ubicación: [`src/features/legajos/api/legajosApi.ts`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/api/legajosApi.ts)

| Método | Endpoint Backend | Descripción | Parámetros / Body | Fallback Mock activo |
| :--- | :--- | :--- | :--- | :---: |
| `GET` | `/EmpleadosPaginados` | Listado paginado de empleados con filtros | `?buscar={q}&estado={e}&categoria={c}&page={p}&size={s}&sort=usuario.apellido,asc` | **SÍ** |
| `GET` | `/ObtenerEmpleado/{id}` | Detalle completo (Ficha 360°) del empleado | `{id}` en URL | **SÍ** |
| `POST` | `/altaEmpleado` | Alta de legajo con foto opcional | `multipart/form-data`: `datos` (JSON Blob de `EmpleadoDto`) + `foto` (File) | NO |
| `PUT` | `/ModificarEmpleado/{id}` | Actualizar datos parciales del legajo | Body: `EmpleadoUpdateDto` | NO |
| `PUT` | `/{id}/foto` | Actualizar foto de perfil | `multipart/form-data`: `foto` (File) | NO |
| `DELETE` | `/BajaEmpleado/{id}` | Registrar baja de empleado | Body: `EmpleadoBajaDto` | NO |
| `PATCH` | `/reactivarLegajo/{id}` | Reactivar legajo inactivo | Body: `ReactivarLegajoRequestDto` | NO |
| `GET` | `/historial-estados/{id}` | Historial de estados operativos/laborales | `{id}` en URL | **SÍ** |

---

## 4. Hooks React Query (`useLegajos.ts`)

Ubicación: [`src/features/legajos/hooks/useLegajos.ts`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/hooks/useLegajos.ts)

* `useLegajosList(filters, page, size)`: Ejecuta la consulta paginada utilizando `legajosApi.getPaginados`.
* `useLegajoDetail(id)`: Consulta la Ficha 360° utilizando `legajosApi.getDetalle`. Se habilita únicamente si `id > 0`.
* `useHistorialEstados(id)`: Consulta el historial utilizando `legajosApi.getHistorialEstados`.
* `useAltaEmpleado()`: Mutación para dar de alta. Invalida la cache `legajosKeys.all` tras éxito.
* `useModificarEmpleado()`: Mutación para modificar legajo. Invalida cache.
* `useActualizarFotoPerfil()`: Mutación para foto. Invalida cache.
* `useBajaEmpleado()`: Mutación de baja. Invalida cache.
* `useReactivarEmpleado()`: Mutación para reactivación. Invalida cache.

---

## 5. Componentes y Estructura Visual (`src/features/legajos/components` y `pages`)

1. **[`LegajosPage.tsx`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/pages/LegajosPage.tsx)**:
   * Vista principal que alterna entre la grilla paginada y la vista de Ficha 360°.
   * Maneja estado local de filtros y selección de empleado.

2. **[`EmpleadoFilters.tsx`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/components/EmpleadoFilters.tsx)**:
   * Barra de búsqueda por texto plano + Select de Categoría UOCRA + Select de Estado.
   * Botón para limpiar filtros.

3. **[`EmpleadoTable.tsx`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/components/EmpleadoTable.tsx)**:
   * Tabla con DNI, Nombre y Apellido, Avatar (o `InitialsAvatar`), Categoría, Badge de Estado y Fecha de Ingreso.
   * Componente de Paginación.
   * Acción "Ver Ficha 360°".

4. **[`EmpleadoDetail360.tsx`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/components/EmpleadoDetail360.tsx)**:
   * Ficha de información en 3 bloques:
     1. Header con avatar, nombre, DNI, CUIL, IERIC y estado actual.
     2. Grid de 2 columnas: Datos Personales (Nacimiento, Género, Nacionalidad, Sangre, Contactos) y Datos Operativos (Ingreso, Categoría, IERIC, Estado).
     3. Línea de tiempo (`EmpleadoTimeline`).

5. **[`EmpleadoTimeline.tsx`](file:///c:/Proyectos/Labortrack-frontend/src/features/legajos/components/EmpleadoTimeline.tsx)**:
   * Visualización vertical del historial de estados (ej. ACTIVO, EN_OBRA, etc.) con fechas desde/hasta y motivo.

---

## 6. Puntos de Cotejo y Refactorización Recomendados

Para alinear el frontend al 100% con la base de datos del Backend:

1. **Eliminar fallbacks silenciosos a Mock**:
   En `legajosApi.ts`, remover los bloques `try...catch` que retornan datos estáticos. Al dejar que el error se propague, React Query activará el estado `isError` y el componente mostrará el banner de error real (ej. 404, 500 o fallo de red) indicando qué falló en la llamada HTTP.

2. **Verificar nombres exactos de endpoints backend**:
   * ¿El endpoint del backend es `/EmpleadosPaginados` o `/api/v1/empleados` / `/api/legajos`?
   * ¿Los parámetros de query son `buscar`, `estado`, `categoria`, `page`, `size` o se usan nombres en snake_case/camelCase diferentes?

3. **Verificar estructura de la respuesta JSON**:
   * ¿El backend devuelve los nombres de campos tal cual (`fotoPerfilKey`, `numeroIeric`, `categoriaActual`, `estadoActual`)?
   * ¿Las respuestas están anidadas dentro de un objeto `usuario` (`usuario.nombre`, `usuario.apellido`) o vienen a nivel raíz?
