# Tokens y convenciones reales — `client/src/index.css`

No existe `tailwind.config.*`: todo vive en el bloque `@theme` de `index.css` (Tailwind v4). No usar colores arbitrarios (`bg-[#...]`).

## Breakpoints (`--breakpoint-*`)

| Nombre | Valor |
|---|---|
| `2xsm` | 375px |
| `xsm` | 425px |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |
| `3xl` | 2000px |

## Colores (familias con escala 25–950)

`brand`, `blue-light`, `gray` (+ `gray-dark`), `orange`, `success`, `error`, `warning`. Usar siempre por nombre semántico (`text-success-600`, `bg-error-50`, `border-brand-500`), nunca un hex suelto.

- `brand-500 = #465fff` — color primario del template.
- `success-500 = #12b76a`, `error-500 = #f04438`, `warning-*` (ver `index.css` línea ~123) — para badges de estado por significado, no por preferencia.

## Tipografía

- Fuente única: `font-outfit` (Outfit, importada de Google Fonts).
- Tamaños tokenizados: `text-title-2xl` (72px) hasta `text-title-sm` (30px) para títulos grandes; `text-theme-xl` (20px), `text-theme-sm` (14px), `text-theme-xs` (12px) para texto de UI. No usar tamaños de Tailwind por defecto (`text-lg`, `text-2xl`, etc.) cuando ya existe el token equivalente.

## Sombras

`--shadow-theme-xs/sm/md/lg/xl` sí existen (ver `index.css` ~L140-150), más `--shadow-tooltip`, `--shadow-focus-ring`, `--shadow-datepicker`, `--shadow-slider-navigation`. Usar estas, nunca `shadow-lg`/`shadow-xl` genéricos de Tailwind sueltos en un contenedor nuevo si ya hay un token equivalente.

## Dark mode

- Variante custom: `@custom-variant dark (&:is(.dark *));` — se activa por la clase `.dark` en `<html>`.
- Controlado por `ThemeProvider`/`useTheme` (`modules/common/contexts/`), persistido en `localStorage`.
- **No** reacciona a `prefers-color-scheme` del sistema — es una preferencia explícita del usuario, no automática.

## Alias de rutas (`vite.config.ts` / `tsconfig.app.json`)

| Alias | Resuelve a |
|---|---|
| `@/` | `src/` |
| `@modules/` | `src/modules/` |
| `@common/` | `src/modules/common/` |
| `@ui/` | `src/modules/common/components/ui/` |
| `@hooks/` | `src/modules/common/hooks/` |
| `@contexts/` | `src/modules/common/contexts/` |
| `@controller/` | `src/modules/*/controller/` |
