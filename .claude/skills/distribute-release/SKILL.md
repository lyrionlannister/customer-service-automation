---
name: distribute-release
description: Versions and builds a release of customer-service-automation (API, client, n8n images) via podman compose. Use when the user asks to "release", "distribuir", "publicar una version", cut a release, or bump the version before shipping.
---

# Distribute Release

Versioning + image-build process for this repo. This skill stops at a built, tagged image set — it does **not** push to a registry or deploy to a server (no production credentials are assumed to be available).

## When to use

- User asks to cut/distribute/publish a release.
- Before a `podman compose up -d --build` that is meant to represent a real version bump, not just a local dev rebuild.

## Versioning

Two independently-versioned workspaces, each with its own `package.json` (`api/`, `client/`). Bump with:

```bash
cd api && npm version patch|minor|major --no-git-tag-version
cd ../client && npm version patch|minor|major --no-git-tag-version
```

Use the **same** bump type for both unless the user says otherwise — they ship together via one compose stack.

Commit the version bump as its own commit, Conventional Commits style (enforced by this repo's `enforce-conventional-commits` hook):

```
chore(release): bump api and client to vX.Y.Z
```

## Build

Always through compose — this repo blocks bare `podman build`/`podman run` via the `podman-compose-only` hook, by design, so the compose file stays the single source of truth for how images are built and wired:

```bash
podman compose build          # builds api, client, n8n, postgres, redis images per docker-compose.yaml
podman compose up -d          # recreate containers from the freshly built images
```

Tag the built images with the version for traceability (optional but recommended before handing off a release):

```bash
podman tag customer-service-automation-api:latest customer-service-automation-api:vX.Y.Z
podman tag customer-service-client:latest customer-service-client:vX.Y.Z
```

## Pre-release checklist

Before tagging, confirm:

- [ ] `cd api && pnpm build && pnpm test` passes (type-check + vitest unit tests)
- [ ] `cd api && pnpm test:arch` passes (dependency-cruiser layering check)
- [ ] `cd client && pnpm lint && pnpm build` passes
- [ ] `.env` / `docker-compose.yaml` required vars are all set for the target environment (see `CLAUDE.md` → Key environment variables)
- [ ] No secrets in the diff being tagged (`git diff` review before the version-bump commit)
- [ ] CHANGELOG or PR description lists what changed since the last tag

## Tag and record

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
```

Do not push the tag or the images anywhere without the user explicitly asking — this skill only prepares a release locally. Pushing to a registry or deploying to `api.kaltrafix.mx` (or any other real host) needs separate, explicit instruction and the relevant credentials.

## See also

- `CLAUDE.md` — architecture, env vars, test commands.
- `.github/workflows/ci.yml` — the same build/test/lint/architecture steps run automatically on every push/PR; a release should never be cut from a commit that hasn't passed CI.
