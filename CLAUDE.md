# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

All commands use **pnpm**. Run from the respective subdirectory (`api/` or `client/`).

### API (`api/`)
```bash
pnpm dev          # Development with hot reload (tsx watch)
pnpm build        # Compile TypeScript → dist/
pnpm start        # Run compiled output (production)
pnpm test         # Type-check (tsc --noEmit)
pnpm test:unit    # Vitest unit tests
```

### Client (`client/`)
```bash
pnpm dev          # Vite dev server on port 4300
pnpm build        # Type-check + Vite build
pnpm lint         # ESLint
pnpm test         # Vitest unit tests
pnpm preview      # Preview production build
```

### Full stack (Podman)
Always go through `podman compose` — never `podman run`/`podman build` a service image directly, the compose file is the source of truth for env wiring between services.
```bash
podman compose up -d --build   # Start all services (API :3000, n8n :5678, Postgres :5432, Redis :6379, client+nginx)
podman compose down            # Stop all services
podman compose up -d <service> # Recreate a single service after an env/code change
```
Inspection commands (`podman ps`, `podman logs`, `podman exec`) are fine directly — the compose-only rule is about service lifecycle (create/run/build), not debugging.

### Local API development (without Docker)
Copy `api/.env.example` to `api/.env` and set `DB_HOST=localhost`, `ENABLE_WHATSAPP_LISTENER=false`. Requires a running PostgreSQL instance with database `app_db`.

## Architecture

**Fullstack customer service platform** with WhatsApp auto-reply and n8n-based automation. No root package.json — each workspace is managed independently.

```
/
├── api/          Express 5 + TypeScript + TypeORM + PostgreSQL backend
├── client/       React 19 + Vite + Tailwind CSS v4 frontend (port 4300)
├── n8n/          Custom n8n image + exported workflow (automation.json)
├── database/     Dockerfiles for Postgres and Redis
├── nginx/        Reverse proxy + TLS (certbot) configs
└── docker-compose.yaml
```

### API structure (`api/src/`)

Follows **Controller → Service → DAO** layering per feature module:

- `auth/` — JWT login/register. Tokens expire in 24h, passwords hashed with bcryptjs. **No role column on `User` yet** — every authenticated user has equal access; `/register` is currently public.
- `chats/` — Conversation/message history backed by n8n's `n8n_chat_histories` table (raw SQL in `chat-history.dao.ts`).
- `whatsapp/` — Singleton `WhatsappListener` and `WhatsappProcessor` using `whatsapp-web.js` (Puppeteer-based). Exposes QR state and connection status via **Server-Sent Events (SSE)**.
- `whatsapp-admin/` — REST endpoints to manage excluded phones and AI-reply toggle. Entities: `ExcludedPhone`, `WhatsappSettings`.
- `repair-notes/`, `price-list/`, `suppliers/`, `message-templates/`, `local/`, `notifications/` — taller (repair shop) domain modules.
- `automation/`, `integrations/` — proxy configuration to n8n webhooks/editor URL.
- `n8n/` — public, unauthenticated routes meant to be called *only* from inside the n8n workflow (template lookup, repair-note lookup, product search). Not gated by network isolation today — verify nginx doesn't proxy it externally before relying on that assumption.
- `import-staging/` — AI-assisted price-list import. `POST /import-staging/upload` stores a staging record in Redis (`import_staging:<tenantId>:<importId>`, 1h TTL) and fires the `n8n/workflows/import-staging.json` webhook; that workflow maps columns with an AI node and calls back `POST /import-staging/callback` (gated by `N8N_INTERNAL_TOKEN`, same secret as `/api/v1/n8n/*`). Client polls `GET /import-staging/:importId`, edits via `PATCH`, then `POST /:importId/commit` writes into `price_list_items` through `PriceListDao`. Reimport the workflow: n8n editor → Import from File → `n8n/workflows/import-staging.json` → set the credential on the AI node → activate → confirm the Webhook node's path is `import-staging`.
- `config/data-source.ts` — TypeORM DataSource. **`synchronize: true`** is enabled (auto-migrates entities in dev — never use in production with real data).

Routes are all prefixed `/api/v1`. CORS allowlist is hardcoded in `index.ts` — keep it in sync with the real deployed origin.

WhatsApp listener only starts when `ENABLE_WHATSAPP_LISTENER=true`. The Puppeteer-driven browser requires Chromium — installed in the Docker image but not locally by default.

### Client structure (`client/src/`)

Feature modules live under `src/modules/`: `auth/`, `chats/`, `whatsapp/`, `repair-notes/`, `price-list/`, `message-templates/`, `users/`, `local/`, `common/` (shared UI, contexts, hooks, layouts, types).

**Contexts** (React Context API, no external state manager): `ThemeContext`, `ToastContext`, `SidebarContext`.

**Auth flow**: tokens stored in `sessionStorage` (`accessToken`, `user`). Route guards in `App.tsx` redirect unauthenticated users to `/admin/sign-in`.

**Forms**: the shared `<Button>` component defaults to `type="button"`. A submit button inside a `<form>` must explicitly pass `type="submit"` or `onSubmit` never fires — this bug has bitten several forms already, check for it when adding a new form.

**Path aliases** (`vite.config.ts` and `tsconfig.app.json`): `@/` → `src/`, `@modules/`, `@common/` → `src/modules/common/`, `@ui/` → `src/modules/common/components/ui/`, `@hooks/`, `@contexts/`, `@controller/` → `src/modules/*/controller/`.

### Database

PostgreSQL 17 shared by the API (`app_db`) and n8n (`n8n` + `customer_service` databases). Redis 7 used for caching with AOF persistence and ACL auth (`REDIS_USER`/`REDIS_PASSWORD` — the API's redis client must authenticate with these, not connect anonymously).

TypeORM entities use UUID primary keys and decorators — requires `experimentalDecorators` and `emitDecoratorMetadata` (already set in `api/tsconfig.json`).

### Key environment variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `ENABLE_WHATSAPP_LISTENER` | API | Starts WhatsApp Puppeteer session |
| `AUTOMATION_URL` | API | n8n webhook endpoint |
| `JWT_SECRET` | API | Token signing — must be set, no safe fallback exists |
| `REDIS_USER` / `REDIS_PASSWORD` | API, Redis | ACL auth against Redis |
| `VITE_API_BASE_URL` | Client | API base URL (set per env in `client/.env.*`) |
| `PUPPETEER_EXECUTABLE_PATH` | API | Override Chromium path (needed outside Docker) |
| `N8N_INTERNAL_TOKEN` | API, n8n | Shared secret for `/api/v1/n8n/*` and `/api/v1/import-staging/callback` |
| `IMPORT_STAGING_WEBHOOK_URL` | API | Webhook URL of `n8n/workflows/import-staging.json` |
| `API_INTERNAL_URL` | API | This API's own URL, used by n8n to call the import-staging callback |

## Testing

- **Unit/integration**: Vitest in both `api/` and `client/` (`pnpm test:unit` / `pnpm test` respectively).
- **Tests live in one top-level `tests/` folder per workspace** (`api/tests/`, `client/tests/`), mirroring the module path under `src/` — e.g. `api/src/auth/services/auth.service.ts` → `api/tests/auth/services/auth.service.test.ts`. Do not colocate `*.test.ts` next to source files; this matches the convention used across the team's other repos.
- **Architecture tests**: `dependency-cruiser` (`api/.dependency-cruiser.cjs`) enforces the Controller → Service → DAO layering — controllers must not import TypeORM/DAOs directly, no circular deps between feature modules. Run via `pnpm test:arch` in `api/`.
- CI (`.github/workflows/ci.yml`) runs build, lint, unit tests and the architecture check on every push/PR.

## Releases

See the `distribute-release` skill (`.claude/skills/distribute-release/SKILL.md`) for the versioning and image-build process.
