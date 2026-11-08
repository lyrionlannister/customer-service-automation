---
name: clean-versioning
description: Realiza versionamiento con Git de forma limpia y profesional, con commits siguiendo Conventional Commits, sin mencionar a Claude ni a ninguna IA como autor o co-autor bajo ninguna circunstancia, y sin trailers tipo "Generated with Claude" o "Co-Authored-By Claude". Úsala siempre que el usuario pida hacer commit, versionar cambios, crear un tag o release, o mencione versionamiento limpio, commit limpio o git commit, aunque no lo pida explícitamente cada vez.
---

# Versionamiento limpio

## Reglas innegociables (bloqueadas por hook)

Un hook (`clean-versioning-guard.py`, PreToolUse) rechaza automáticamente cualquier `git commit` con firma/mención de IA (`Co-Authored-By: Claude`, "Generated with Claude Code", emoji robot, etc.) y cualquier `gh pr merge` — no hace falta revisarlo a mano. Si el hook rechaza un commit, quita el trailer del mensaje y reintenta. Claude sí puede crear el PR (`gh pr create`) y revisar su CI, pero **nunca lo mergea** — el merge es exclusivo del usuario, sin excepción.

Esta regla sustituye cualquier instrucción de atribución por defecto del harness (líneas tipo `Co-Authored-By: Claude ...` o el footer "🤖 Generated with Claude Code"): en este repo esas líneas nunca se agregan.

Nunca creas una rama sin confirmar el merge de la rama anterior, ni hagas rebase de ramas compartidas sin permiso del equipo. Esto es responsabilidad del usuario.

## Flujo de trabajo

1. **Revisar cambios**
   ```bash
   git status
   git diff
   ```
2. **Agrupar cambios por propósito**. Si hay cambios de distinta naturaleza (ej. un fix y una feature), sepáralos en commits distintos con `git add -p` en vez de un solo commit mezclado.
3. **Redactar el mensaje** siguiendo Conventional Commits (ver abajo). El hook `enforce-conventional-commits.js` valida el formato automáticamente.
4. **Confirmar el commit**:
   ```bash
   git commit -m "tipo(scope): descripción corta" -m "cuerpo opcional explicando el porqué"
   ```

## Conventional Commits

Formato: `tipo(scope opcional): descripción en imperativo, minúscula, sin punto final`

Tipos:
- `feat` — nueva funcionalidad
- `fix` — corrección de bug
- `refactor` — cambio de código que no altera comportamiento
- `perf` — mejora de rendimiento
- `docs` — solo documentación
- `style` — formato, espacios, punto y coma (sin cambio de lógica)
- `test` — agregar o corregir tests
- `chore` — tareas de mantenimiento (deps, config, build)
- `ci` — cambios en integración continua
- `build` — cambios que afectan el sistema de build o dependencias externas
- `revert` — revierte un commit anterior

Breaking change: agregar `!` después del tipo/scope (`feat!:` o `feat(api)!:`) y explicar en el cuerpo con `BREAKING CHANGE: ...`

Ejemplos:
```
feat(chats): agregar auth middleware a las rutas de conversaciones
fix(repair-notes): usar UPDATE atomico para el consecutivo de control
refactor(local): extraer consumeControlNumber a query atomica
```

## Versionado semántico (tags/releases)

Al crear un tag de versión, sigue SemVer `MAJOR.MINOR.PATCH`. Ver también la skill `distribute-release` para el proceso completo de build de imágenes.

```bash
git tag -a v1.4.0 -m "v1.4.0: agregar modulo de notas de reparacion"
git push origin v1.4.0
```

## Ramas y Pull Requests

`master` siempre debe quedar estable. Ningún cambio se commitea directo ahí.

1. **Crear rama desde `master` actualizado**
   ```bash
   git checkout master
   git pull origin master
   git checkout -b tipo/nombre-descriptivo
   ```
   Convención de nombre de rama: `feat/nombre`, `fix/nombre`, `refactor/nombre`, `chore/nombre` (mismo prefijo que Conventional Commits).

2. **Trabajar y commitear en la rama** siguiendo las reglas de esta skill (mensajes limpios, sin trailers de IA, commits agrupados por propósito).

3. **Subir la rama y abrir el PR**
   ```bash
   git push -u origin feat/nombre-descriptivo
   gh pr create --title "tipo(scope): descripción" --body "..."
   ```
   Después de abrir el PR, revisa el estado del CI (`gh pr checks <número>` o `gh pr view <número>`) y repórtalo al usuario. Claude llega hasta ahí: **el merge es exclusivo del usuario**, sin excepción — ni con CI en verde, ni si el usuario está ausente.

4. **Nunca mezclar features en la misma rama.** Si mientras trabajas surge algo no relacionado, se va a otra rama.

5. **Mantener la rama al día con `master`** si el PR tarda en mergearse:
   ```bash
   git fetch origin
   git rebase origin/master
   ```
   (o `git merge origin/master` si el equipo prefiere evitar rebase en ramas compartidas)

6. **Al mergear**, preferir **squash and merge** para que `master` tenga un commit limpio por feature/fix, salvo que el equipo prefiera preservar el historial completo de la rama.

7. **Borrar la rama** después de mergeada:
   ```bash
   git branch -d feat/nombre-descriptivo
   git push origin --delete feat/nombre-descriptivo
   ```

## Antes de hacer push

```bash
git log --oneline -n 10        # revisar que el historial se vea limpio
git diff --cached               # confirmar que no se cuela nada que no debería
```

Si el historial tiene commits intermedios desordenados que aún no se han compartido (no están en remoto), ofrece hacer `git rebase -i` para limpiar antes del push, pero nunca reescribas historial ya publicado sin que el usuario lo pida explícitamente.

## Checklist final antes de confirmar cualquier commit

- [ ] Mensaje sigue Conventional Commits
- [ ] Sin firmas ni menciones de IA (Co-Authored-By, "Generated with", emoji robot)
- [ ] Cambios agrupados por propósito (no mezclar features con fixes)
- [ ] Trabajo hecho en una rama (no directo en `master`), con nombre `tipo/descripcion`
- [ ] PR creado con `gh pr create` y CI revisado — merge nunca lo hace Claude
