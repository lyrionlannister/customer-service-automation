---
name: tailadmin-react
description: Usar SIEMPRE que se cree o modifique UI en este proyecto (componentes, páginas, layouts, formularios, tablas, cards, modales, sidebar, header). Este cliente YA ES el template TailAdmin React (React 19 + TypeScript + Tailwind CSS v4) — mismos breakpoints, mismos tokens de color, mismo mecanismo de dark mode. Garantiza que todo markup nuevo se desarrolle mobile first, sea responsive, y reutilice los componentes/tokens ya existentes en vez de crear estilos nuevos desde cero. Aplica incluso si el usuario no menciona explícitamente "TailAdmin".
---

# TailAdmin React — Reglas de desarrollo UI (customer-service-automation)

## 1. Responsive obligatorio · mobile first

- **Se desarrolla mobile first, sin excepciones.** Las clases sin prefijo son el diseño a 375px; los breakpoints reales de este proyecto (definidos en `@theme` de `client/src/index.css`, no son los defaults de Tailwind) son: `2xsm` (375px), `xsm` (425px), `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px), `3xl` (2000px).
- **Sin scroll horizontal de página.** Cualquier cosa más ancha que el viewport (tablas, filas de items) scrollea dentro de su propio `overflow-x-auto`, nunca empujando la página completa.
- Sidebar/layout ya resuelto en `modules/common/layouts/Layout.tsx` + `modules/common/components/menu/aside-menu.tsx`, controlado por `useSidebar()` (`modules/common/hooks/use-sidebar.ts` + `sidebar-context.tsx`). No reimplementar ese comportamiento en una página nueva.
- Verificar en el navegador (chrome-devtools), empezando por móvil: 375px, 768px, 1024px, 1280px. 1024px es el punto delicado en todo template TailAdmin: el sidebar pasa a fijo y el contenido pierde ancho.

## 2. Reutilización antes que creación

Antes de escribir un componente nuevo, revisar el inventario real (`references/componentes.md`). Lo que ya existe en `modules/common/components/ui/`:

`Alert`, `Avatar`, `Badge`, `Button`, `Dropdown`/`DropdownItem`, `Input`/`Label`/`FileInput`, `Loader`/`Spinner`, `Modal`, `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableCell`, `Toggle`, `Tooltip`, `ColumnImageGrid`/`ResponsiveImage`.

**No existen todavía** (no inventar sin avisar que se está agregando): `DatePicker` real (hoy varios formularios usan `<Input type="date">` nativo — es una inconsistencia conocida del proyecto, no un patrón a copiar en código nuevo si se puede evitar), `DataTable`/`Pagination` envolviendo `Table` (cada página arma su propia tabla+paginación a mano sobre los primitivos de `table.tsx`), componentes de gráficos (`ui/charts/*` no existe aún — se crean como parte del trabajo de dashboards, ver `tailadmin-design-language`).

Extender vía props/composición, no reinventar. Revisar `references/convenciones.md` antes de escribir una clase de color/espaciado repetida a mano.

## 3. Convenciones de estilo

- **Dark mode obligatorio, sin excepciones** en todo elemento nuevo o modificado. La variante `dark:` es custom (`@custom-variant dark (&:is(.dark *));` en `index.css`), activada por la clase `.dark` en `<html>` vía `ThemeProvider`/`useTheme` (persistida en `localStorage`), **no** por `prefers-color-scheme`.
- Antes de dar una pantalla por terminada, alternar el tema y revisar visualmente que nada se pierda contra el fondo oscuro — vistas "de documento" (reportes, notas para imprimir/PDF) también deben verse bien en ambos modos si se renderizan dentro del `Layout` normal del admin.
- **Tokens, no colores arbitrarios.** No existe `tailwind.config.*` — todo vive en el bloque `@theme` de `client/src/index.css`: familias `brand`, `blue-light`, `gray` (+ `gray-dark`), `orange`, `success`, `error`, `warning`. Nunca `bg-[#123456]`.
- Tipografía: fuente única `font-outfit`, tamaños tokenizados `text-title-sm`, `text-theme-xs`, etc. (ver `@theme` en `index.css`). No tamaños inventados.
- Radios/sombras: reutilizar lo ya usado en `Button`/`Input`/`Modal` (`rounded-lg`/`rounded-xl`/`rounded-2xl`, `shadow-theme-xs/sm/md/lg/xl` si existen esas variables en `@theme`; si no, usar las sombras default de Tailwind con moderación, nunca `shadow-lg` decorativo suelto).

## 4. Iconografía (mixta en este proyecto)

Este cliente mezcla dos fuentes de íconos, a diferencia de un TailAdmin "limpio":
- **SVGs propios del template** en `modules/common/icons/` (barril en `icons/index.ts`) — para iconografía de chrome/feedback que ya trae el template (alertas, flechas de UI, etc.).
- **`lucide-react`** — para íconos de acción en botones/headers de las páginas de features (ya se usa así en `repair-note-print-page.tsx`, `dashboard-page.tsx`, etc.).

Seguir el que ya use la pantalla vecina del mismo módulo; no mezclar dos grosores/estilos de ícono distintos dentro de una misma pantalla.

## 5. Estructura de componentes

- TypeScript siempre. Props tipadas en `modules/common/types/interfaces/props/<nombre>-props.ts`, **export default** de la interfaz (ej. `export default interface ButtonProps { ... }`) — así está todo lo existente, no cambiar a `export type` porque no es la convención real de este repo.
- Componente = un archivo `.tsx`, **export default** del componente (`const Xxx: React.FC<XxxProps> = (...) => {...}; export default Xxx;`) — así están `Button`, `Table`, etc. en este repo (al revés de otros proyectos del equipo que usan named export; aquí es default).
- Ubicación:
  - UI genérico reutilizable entre features → `client/src/modules/common/components/ui/<nombre-carpeta>/<nombre>.tsx`, props hermanas en `modules/common/types/interfaces/props/`.
  - Específico de una feature → `client/src/modules/<feature>/components/<nombre>.tsx`.
  - Páginas → `client/src/modules/<feature>/pages/<nombre>-page.tsx`.
  - Hooks de datos → `client/src/modules/<feature>/hooks/use-<nombre>.ts`.

## 6. Checklist antes de terminar

- [ ] Mobile first, verificado a 375px / 768px / 1024px / 1280px, sin scroll horizontal de página
- [ ] Dark mode cubierto en toda clase de color
- [ ] Reutiliza componentes/tokens existentes de `references/componentes.md` / `references/convenciones.md`
- [ ] Props tipadas en `types/interfaces/props/`, `export default`, sin `any`
- [ ] Sin anchos fijos en contenedores principales (`w-full`/`max-w-*`/`flex`/`grid`, no `w-[Npx]`)

## Referencias

- `references/componentes.md` — inventario real de `modules/common/components/ui/` (props, cuándo usar cada uno).
- `references/convenciones.md` — tokens de color/tipografía/breakpoints reales de `index.css`.
- Repo fuente del template (para copiar markup/composición cuando haga falta un patrón que no existe aquí todavía, ej. gráficos): `C:\Users\Administrador\Documents\GitHub\tailadmin-template`. Adaptar siempre a las convenciones de arriba (default export, ubicación de props) antes de integrarlo — no pegar tal cual.
