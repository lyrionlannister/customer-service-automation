# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

All commands use **pnpm**. Run from the respective subdirectory (`api/` or `client/`).

### API (`api/`)
```bash
pnpm dev          # Development with hot reload (tsx watch)
pnpm build        # Compile TypeScript → dist/
pnpm start        # Run compiled output (production)
pnpm test         # Type-check only (tsc --noEmit)
```

### Client (`client/`)
```bash
pnpm dev          # Vite dev server on port 4300
pnpm build        # Type-check + Vite build
pnpm lint         # ESLint
pnpm preview      # Preview production build
```

### Full stack (Podman)
```bash
podman compose up --build    # Start all services (API :3000, n8n :5678, Postgres :5432, Redis :6379)
podman compose down          # Stop all services
```

### Local API development (without Docker)
Copy `api/.env.example` to `api/.env` and set `DB_HOST=localhost`, `ENABLE_WHATSAPP_LISTENER=false`. Requires a running PostgreSQL instance with database `app_db`.

## Architecture

This is a **fullstack customer service platform** with WhatsApp auto-reply capabilities and n8n-based automation. No root package.json — each workspace is managed independently.

```
/
├── api/          Express 5 + TypeScript + TypeORM + PostgreSQL backend
├── client/       React 19 + Vite + Tailwind CSS v4 frontend (port 4300)
├── n8n/          Custom n8n image + exported workflow (automation.json)
├── database/     Dockerfiles for Postgres and Redis
└── docker-compose.yaml
```

### API structure (`api/src/`)

Follows **Controller → Service → DAO** layering per feature module:

- `auth/` — JWT login/register. Tokens expire in 24h, passwords hashed with bcryptjs.
- `whatsapp/` — Singleton `WhatsappListener` and `WhatsappProcessor` using `whatsapp-web.js` (Puppeteer-based). Exposes QR state and connection status via **Server-Sent Events (SSE)**.
- `whatsapp-admin/` — REST endpoints to manage excluded phones and AI-reply toggle. Entities: `ExcludedPhone`, `WhatsappSettings`.
- `automation/` — Proxies configuration to n8n webhooks.
- `config/data-source.ts` — TypeORM DataSource. **`synchronize: true`** is enabled (auto-migrates entities in dev — never use in production with real data).

Routes are all prefixed `/api/v1`. CORS is locked to `http://localhost:4300`.

WhatsApp listener only starts when `ENABLE_WHATSAPP_LISTENER=true`. The Puppeteer-driven browser requires Chromium — installed in the Docker image but not locally by default.

### Client structure (`client/src/`)

Feature modules live under `src/modules/`:

- `auth/` — Login and register pages with their own controller (`auth-controller.ts`) that calls the API.
- `whatsapp/` — Admin page for managing WhatsApp sessions, QR scanning, and excluded phones.
- `common/` — Shared UI components, contexts, hooks, layouts, and types.

**Contexts** (React Context API, no external state manager):
- `ThemeContext` — light/dark mode, persisted in localStorage.
- `ToastContext` — global toast notifications.
- `SidebarContext` — sidebar open/close state.

**Auth flow**: tokens stored in `sessionStorage` (`accessToken`, `user`). Route guards in `App.tsx` redirect unauthenticated users to `/admin/sign-in`.

**Path aliases** (configured in `vite.config.ts` and `tsconfig.app.json`):
| Alias | Resolves to |
|-------|-------------|
| `@/` | `src/` |
| `@modules/` | `src/modules/` |
| `@common/` | `src/modules/common/` |
| `@ui/` | `src/modules/common/components/ui/` |
| `@hooks/` | `src/modules/common/hooks/` |
| `@contexts/` | `src/modules/common/contexts/` |
| `@controller/` | `src/modules/*/controller/` |

### Database

Single PostgreSQL 16 instance shared by the API (`app_db`) and n8n (separate `n8n` database). Redis 7 used for caching with AOF persistence enabled.

TypeORM entities use UUID primary keys and decorators — requires `experimentalDecorators` and `emitDecoratorMetadata` (already set in `api/tsconfig.json`).

### Key environment variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `ENABLE_WHATSAPP_LISTENER` | API | Starts WhatsApp Puppeteer session |
| `AUTOMATION_URL` | API | n8n webhook endpoint |
| `JWT_SECRET` | API | Token signing |
| `VITE_API_BASE_URL` | Client | API base URL (set per env in `client/.env.*`) |
| `PUPPETEER_EXECUTABLE_PATH` | API | Override Chromium path (needed outside Docker) |
