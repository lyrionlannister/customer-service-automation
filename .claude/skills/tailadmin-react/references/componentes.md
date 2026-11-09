# Inventario real de componentes — `client/src/modules/common/components/ui/`

Generado a partir del código real del repo (no asumido). Revisar esto antes de crear un componente nuevo.

| Componente | Archivo | Notas |
|---|---|---|
| `Alert` | `ui/alert/alert.tsx` | variantes de feedback (ver `variant` prop) |
| `Avatar` | `ui/avatar/Avatar.tsx` | |
| `Badge` | `ui/badge/badge.tsx` | usar para cualquier estado de negocio con la paleta semántica |
| `Button` | `ui/button/button.tsx` | default `type="button"` — **todo botón de submit dentro de un `<form>` necesita `type="submit"` explícito**, es un bug ya encontrado varias veces en este repo |
| `Dropdown` / `DropdownItem` | `ui/dropdown/` | |
| `Input` / `Label` | `ui/inputs/` | no hay `DatePicker` real — los formularios de fecha usan `<Input type="date">` nativo (inconsistencia conocida, no el ideal de un TailAdmin "limpio") |
| `FileInput` | `ui/inputs/file-input.tsx` | |
| `Loader` | `ui/loader/loader.tsx` | úsalo como spinner de carga en vez de inventar uno nuevo |
| `Modal` | `ui/modal/modal.tsx` | no hay `ConfirmModal` separado — se usa `Modal` directo para confirmaciones |
| `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableCell` | `ui/table/table.tsx` | primitivos puros (como `<table>`/`<thead>`/etc.), **sin** wrapper de scroll ni de paginación — cada página que los usa arma su propio `overflow-x-auto` y su propia paginación a mano. Si un módulo nuevo necesita tabla+paginación reusable, construirla una vez y compartirla, no copiarla por página. |
| `Toggle` | `ui/toggle/toggle.tsx` | switch on/off |
| `Tooltip` | `ui/tooltip/tooltip.tsx` | |
| `ColumnImageGrid` / `ResponsiveImage` | `ui/images/` | |

## No existe todavía (crear solo cuando el módulo lo necesite, siguiendo el patrón visual de TailAdmin)

- **Gráficos** (`ui/charts/*`) — `apexcharts`/`react-apexcharts` ya están en `package.json`, pero no hay ningún componente de chart construido aún. Primer uso real: dashboards de ingresos (por empleado, por venta de accesorios, por tipo de nota).
- **`DataTable` con paginación** — no existe como componente compartido, solo los primitivos de `table.tsx`.
- **`DatePicker`** real (flatpickr o similar) — hoy se usa `<Input type="date">` nativo.

## Iconos

- `modules/common/icons/` — SVGs propios del template, barril en `icons/index.ts` (ej. `ErrorHexaIcon`, `AlertHexaIcon`, `MoreDotIcon`, etc.).
- `lucide-react` (dependencia de `package.json`) — usado directo como componentes JSX en páginas de features (ej. `ArrowLeft`, `Printer`, `MessageSquare`, `CalendarDays` en `repair-note-print-page.tsx` / `dashboard-page.tsx`).

## Layout

- `modules/common/layouts/Layout.tsx` — layout principal del admin.
- `modules/common/layouts/sign-in-layout.tsx` — layout de auth (sin sidebar).
- `modules/common/components/menu/aside-menu.tsx` — sidebar, controlado por `useSidebar()` (`modules/common/hooks/use-sidebar.ts` + `modules/common/contexts/sidebar-context.tsx`).
- `modules/common/components/menu/user-dropdown.tsx`, `theme-toggle-button.tsx` — header.
