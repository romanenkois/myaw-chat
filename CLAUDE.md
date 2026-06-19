# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`myaw-chat` is the **umbrella repo** for Myaw chat (a messenger app). It contains no
application code of its own — it links the service/lib/tool repos as **git submodules**
and holds the shared Docker setup (`docker-compose.yml`, `docker/`).

Each submodule is its own standalone repo with its **own toolchain and commands** — do
not assume one submodule's tooling applies to another. Run `git submodule update --init
--recursive` to populate them.

## Submodules

### Active

| Path | Purpose | Stack / commands |
|------|---------|------------------|
| `myaw-frontend` | Web client + admin apps (public) | Angular + Nx. `npm start` (= `nx serve client`), `nx build/test/lint client`. Prettier + ESLint. |
| `myaw-backend` | Backend services (private) | NestJS + Nx. Apps: `auth-service`, `main-service`, `realtime-service`. `npx nx serve <app>`. Prettier + ESLint. |
| `myaw-contracts` | Shared request/response DTOs (private) | Pure TypeScript, **no build/publish** — consumed as source via tsconfig path alias `@myaw/contracts`. |
| `myaw-cli` | CLI to manage app infrastructure (public) | Ink/React + TypeScript on **Bun**. `bun run start`, `bun test`, `bunx tsc --noEmit`. **Biome** (not ESLint/Prettier) for lint/format. |
| `myaw-ui` | Perspective custom UI library (private) | Planned to split out of `myaw-frontend`. |

### Deprecated — being collapsed into `myaw-backend`

`myaw-main-api` (Express REST) and `myaw-realtime` (socket.io) are legacy and are being
merged into the single Nx + NestJS `myaw-backend` workspace. See `backend-migration.md`
for the plan. Prefer `myaw-backend` for new backend work; don't extend the legacy two.

### Remote status — IMPORTANT

The umbrella (`myaw-chat`) **and some submodules have a GitHub remote**; the rest are
**purely local (no remote, by intent for now)**:

| Repo | Remote |
|------|--------|
| `myaw-chat` (umbrella), `myaw-frontend`, `myaw-contracts`, `myaw-cli` | ✅ has a GitHub remote |
| **`myaw-backend`, `myaw-main-api`, `myaw-realtime`, `myaw-ui`** | ❌ **local only — no remote** |

`myaw-contracts` lives at `https://github.com/romanenkois/myaw-contracts`.

For the local-only repos, **never run `git pull` / `git fetch` / `git push`** —
they have no `origin`, and doing so produces misleading "Not Found" errors. Only commit
locally. Note `myaw-backend` contains its own nested `contracts` submodule (at
`libs/shared/contracts`) which **does** have a remote and can be pushed.

## Conventions that span repos

- **`@myaw/contracts` is the single source of truth** for DTOs crossing the wire between
  backend and frontend. Names are **perspective-neutral**: `{Name}RequestDto` (client →
  server) and `{Name}ResponseDto` (server → client) — never `Incoming`/`Outgoing`.
  Interfaces only, no runtime behavior.
- Backend apps each stay their **own deploy unit / container** (microservices) — the Nx
  monorepo is not a single deploy unit.

## Working with submodules

- Editing inside a submodule changes that submodule's repo; commit there, then update the
  pointer in the parent: `git add <submodule-path>` in the parent, then commit the parent.
- **Do NOT run `git submodule update` to "sync after committing in a submodule".** That
  command does the *opposite* — it checks the submodule back out to the commit the parent
  already records (detached HEAD), silently reverting work you just committed. Your commit
  isn't lost (it's still on the submodule's branch / remote); recover with
  `git checkout master` inside the submodule. Sync flows parent → submodule, not the reverse.
- `./dev` initializes/syncs submodules (and starts Docker / runs ad-hoc Nx generators).
- Full local stack: `docker compose up` (nginx on `:80`, client `:4200`, admin `:4201`,
  Mongo, backend services).
