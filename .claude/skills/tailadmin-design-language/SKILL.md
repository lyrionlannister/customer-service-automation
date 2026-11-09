---
name: tailadmin-design-language
description: OBLIGATORIA para cualquier trabajo de diseño visual en `client/src/**` — pantallas nuevas, rediseños, dashboards, secciones nuevas de un módulo (reparaciones, inventario, caja, cotizaciones, empleados). Fuerza que el resultado se vea y se sienta como parte de la familia TailAdmin (composición, densidad, jerarquía tipográfica, iconografía, estilo de cards/charts/badges), aunque el dominio (taller de celulares) no tenga nada que ver con la demo. Esta skill fija la DIRECCIÓN ESTÉTICA; `tailadmin-react` fija las reglas técnicas (responsive, dark mode, ubicación de archivos). Úsalas juntas. Tiene prioridad sobre el criterio estético genérico: no se inventa un lenguaje visual nuevo, se reproduce el de TailAdmin.
---

# Lenguaje de diseño TailAdmin — obligatorio para todo `client/src/**`

Este cliente ya **es** TailAdmin (mismos tokens, mismos breakpoints, mismo mecanismo de dark mode), con el dominio de un taller de reparación/venta de celulares y accesorios en vez de la demo. Regla de oro: si una pantalla nueva no se ve como si perteneciera a la demo de TailAdmin, está mal, sin importar que los datos sean de notas de reparación, caja o inventario.

Esto no es "usa los componentes de `ui/`" (eso lo cubre `tailadmin-react`): es una regla de **composición y sensación visual** — cuánto padding lleva una sección, qué tan densa es una tabla, cómo se agrupan stat cards y gráficos, qué color de badge usa cada estado.

## 1. Antes de diseñar una pantalla o sección nueva

1. Mirar primero una pantalla existente del mismo tipo en este repo (`modules/chats/pages/dashboard-page.tsx` para dashboards con métricas, `modules/repair-notes/pages/*` para CRUD+formulario+detalle, `modules/price-list/pages/*` para listados tabulares).
2. Si no hay análogo claro en este repo (ej. el futuro módulo de inventario, caja, o los dashboards de ingresos por empleado/accesorio/tipo de nota), buscar el patrón en la demo (https://react-demo.tailadmin.com/) o en el repo fuente completo (`C:\Users\Administrador\Documents\GitHub\tailadmin-template`):
   - Dashboard de ingresos (por empleado, por accesorio, por tipo de nota) → patrón `components/saas`/`components/analytics`/`components/ecommerce` (stat cards arriba, gráfico y tabla abajo).
   - Inventario → patrón `components/ecommerce` (listado de productos con stock) o `components/tables`.
   - Caja (sesión de apertura/cierre, movimientos) → patrón `components/invoice` para el resumen + `components/tables` para el listado de movimientos.
   - Cotizaciones/notas para imprimir → patrón `components/invoice`.
3. Copiar la **composición**, no el texto ni los datos. Adaptar a las convenciones de este repo (`export default`, ubicación de archivos, dark mode) antes de integrar — ver `tailadmin-react`.

## 2. Elementos que no se pueden romper

- **Cards como unidad base**: `rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3` (o `p-6` en secciones grandes). Nada de `shadow-lg` decorativo suelto, bordes de color arbitrarios, ni gradientes que no existan ya en `@theme`.
- **Dashboards = métricas arriba + gráfico/tabla abajo.** Nunca solo una tabla sin contexto numérico cuando el dato es agregable (ingresos, conteos). Los tres dashboards nuevos de ingresos (por empleado, por venta de accesorios, por tipo de nota) siguen este mismo esqueleto: fila de stat cards (total del período, variación) + gráfico (barras apiladas o dona para el desglose por tipo/empleado) + tabla de detalle debajo.
- **Gráficos: apexcharts vía `react-apexcharts`** (ya está en `client/package.json`) — es la librería de charts del template TailAdmin, no se introduce otra. Los componentes de `ui/charts/*` no existen todavía en este repo: se crean siguiendo el patrón visual de TailAdmin (donut para desglose por categoría, barras apiladas para series por período) la primera vez que se necesiten, no se improvisa un tipo de gráfico ajeno al estilo del template.
- **Badges de estado con la paleta semántica** (`success`/`error`/`warning`/`brand`): mapear el estado de negocio (nota recibida/en reparación/lista/entregada, caja abierta/cerrada, cotización pendiente/aceptada/rechazada) a una de esas familias por significado. No existe componente `Badge` separado del de `ui/badge/badge.tsx` — usar ese.
- **Iconografía**: ver convención mixta (`icons/` propio + `lucide-react`) en `tailadmin-react`. Mismo grosor/tamaño que los íconos vecinos del mismo módulo.
- **Jerarquía tipográfica y densidad**: tamaños tokenizados (`text-title-sm`, `text-theme-xs`, etc.), ritmo de `gap-4/5/6` y `p-4/5/6` ya usado en páginas existentes — no comprimir ni airear "porque se ve mejor".
- **Mobile first**: resolver primero 375px (cards apiladas, una columna, tabla con su propio scroll) antes de `md`/`xl`.
- **Dark mode obligatorio** en todo lo nuevo, incluyendo vistas "de documento" (recibo de reparación, cotización) cuando se muestran dentro del admin.
- Nada de neumorfismo, glassmorfismo, gradientes llamativos, sombras fuera de lo que ya usa el template: TailAdmin es plano, bordes sutiles, sombras discretas.

## 3. Relación con otras skills

- `tailadmin-react` = reglas técnicas (responsive, dark mode, dónde va cada archivo, inventario real de componentes). Cárgala junto a esta siempre que se toque UI.
- `dataviz` (si está disponible en la sesión) = mecánica de color/accesibilidad para los gráficos nuevos de `ui/charts/*` — úsala para la paleta y legibilidad de esos gráficos específicos, pero la composición general (dónde va el gráfico, qué tan grande, qué lo acompaña) la decide esta skill, no `dataviz` por sí sola.

## 4. Checklist antes de dar por terminada una pantalla o sección nueva

- [ ] Se identificó un análogo (pantalla de este repo, demo o repo del template) y se replicó su composición
- [ ] Dashboards nuevos siguen el esqueleto stat cards + gráfico + tabla
- [ ] Gráficos con `react-apexcharts`, ningún otro tipo/librería
- [ ] Badges de estado mapeados a `success`/`error`/`warning`/`brand` por significado
- [ ] Íconos consistentes con el módulo (ver convención mixta)
- [ ] Jerarquía tipográfica y densidad consistentes con pantallas del mismo tipo
- [ ] Mobile first, revisada en 375px antes de ampliar
- [ ] Revisada en modo claro y oscuro
- [ ] Nada de glassmorfismo/neumorfismo/gradientes/sombras fuertes ajenas al template
