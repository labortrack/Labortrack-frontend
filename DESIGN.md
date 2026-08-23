# Design system de LaborTrack

Este documento describe las decisiones visuales del producto. Su implementación ejecutable vive en `src/styles/tokens.css`, y los componentes React reutilizables en `src/shared`.

## Principios

- Claridad para flujos administrativos y operativos de alta densidad.
- Apariencia profesional, robusta y moderna.
- Accesibilidad y estados visibles de foco, error, carga y deshabilitado.
- Consistencia antes que personalización aislada por pantalla.
- Diseño responsive desde controles pequeños hasta tablas de escritorio.

## Fundamentos

### Color

- Azul: marca, navegación y acciones principales.
- Naranja: atención operativa y acciones secundarias destacadas.
- Verde: éxito y validación.
- Rojo: error y acciones destructivas.
- Neutros: superficies, contenido, bordes y estados deshabilitados.

Los componentes usan nombres semánticos como `primary`, `error`, `foreground` o `border`; no colores escritos directamente en JSX. El degradado naranja de autenticación es un recurso de marca de LaborTrack.

### Tipografía

La familia principal es Manrope. Los títulos usan peso medio para mantener una jerarquía clara; botones y etiquetas funcionales pueden usar mayor peso y espaciado entre letras. Las tablas priorizan legibilidad y densidad.

### Espaciado y layout

- Unidad base: 8 px; se admiten pasos de 4 px en controles compactos.
- Contenido de escritorio: ancho máximo de 1366 px.
- Márgenes móviles: 16 px.
- Celdas de tabla: 12 px verticales y 16 px horizontales como referencia.

### Formas y profundidad

- Controles: radio de 4 px.
- Elementos intermedios: radio de 8 px.
- Tarjetas y diálogos: radio de 16 px.
- Píldoras: únicamente estados o filtros, no botones de acción.
- Bordes sutiles para estructura; sombras suaves en tarjetas y más marcadas en overlays.

## Capas del sistema

1. **Tokens:** valores base y nombres semánticos en `src/styles/tokens.css`.
2. **Primitivas UI:** Button, Input, Select, Dialog, Table, Badge, Tabs y demás piezas en `src/shared/ui`.
3. **Patrones de aplicación:** FormField, PasswordField, PageHeader, Pagination, estados de datos y ConfirmDialog en `src/shared/components`.
4. **Componentes de negocio:** formularios y diálogos específicos dentro de cada feature.

Esta jerarquía permite reutilizar piezas sin acoplar el sistema visual a un módulo concreto.

## Componentes y estados

Todo control interactivo debe contemplar, cuando corresponda:

- estado normal, hover, foco y deshabilitado;
- carga sin doble envío;
- error asociado mediante texto y atributos accesibles;
- operación por teclado y foco controlado en overlays.

Radix se utiliza solamente en primitivas complejas que requieren comportamiento accesible, como diálogos, selects, menús, popovers, tooltips, tabs, switches y radio groups. No se incorpora un catálogo completo sin una necesidad real.

## Reglas de producto actuales

- La marca se escribe siempre **LaborTrack**.
- Los roles globales son `ROLE_ADMIN`, `ROLE_RRHH` y `ROLE_OPERARIO`.
- Capataz es una asignación contextual de una obra, no un rol global.
- La recuperación de contraseña siempre muestra una respuesta neutral para no revelar cuentas existentes.
- Los contratos del backend prevalecen sobre datos ficticios del prototipo de Figma.
- Los componentes nuevos se incorporan cuando existe un caso de uso concreto y reutilizable.

## Alcance inicial del catálogo

El catálogo actual cubre autenticación, navegación, formularios, feedback, diálogos, tablas, filtros y paginación. Los componentes visualizados en Figma para módulos futuros —por ejemplo QR, jornadas, calendarios o carruseles— se implementarán cuando esas pantallas entren en alcance.
