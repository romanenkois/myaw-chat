# Backend Migration — rough plan

Status: **draft / approximate.** Direction agreed, details to refine while building.

## Goal

Collapse the two backend submodules (`myaw-main-api`, `myaw-realtime`) into a single
**Nx + NestJS** monorepo, kill the duplicated `shared/` code, and make REST + sockets
share one auth mechanism. Frontend stays its own separate Nx repo (untouched).

## Why we're doing it

- `shared/{schemas,types,mappers}` is currently **duplicated** in both services and will drift.
- Both services hit the **same Mongo** — DB models/DTOs want one source of truth.
- `main-api` (Express, hand-rolled routers/mappers/swagger) has boilerplate worth rewriting.
- Nest's module/DI model matches the Angular frontend mental model → low context-switch cost.
- REST and socket service must authenticate **the same user with the same token**.

## Non-goals (for now)

- ❌ No real ecosystem SSO / identity provider yet. Build auth so it can become that later.
- ❌ Do **not** merge frontend into this monorepo. Two separate Nx workspaces.
- ❌ Monorepo is **not** a single deploy unit — each app stays its own container (microservices).

---

## Target layout

```
myaw-backend/                 (new Nx workspace)
├── apps/
│   ├── main-api              REST. Rewritten thin in Nest. Owns login, issues JWT.
│   └── realtime              Nest + socket.io. Verifies JWT only, no login.
├── libs/
│   ├── shared                DTOs, types, zod/validation schemas, mappers (single source)
│   ├── db                    Mongo connection + repositories
│   ├── auth                  jwt sign/verify, guards, decorators, socket auth middleware
│   └── common                pipes, filters, interceptors, logging
└── (each app → own Dockerfile / build target)
```

`apps/auth` is intentionally **not** here yet — auth lives as a lib until/unless we
decide to host a real IdP (Zitadel/Logto/Keycloak), at which point `libs/auth`
becomes verify-only against the IdP's JWKS.

---

## Auth model (shared, SSO-deferred)

- **`main-api` issues tokens** — owns login (reuse existing argon2 + jwt), signs a JWT.
- **`libs/auth` verifies tokens** — imported by *both* apps, same key, same `User` shape.
- **`realtime` only verifies** — JWT comes in on the socket handshake:

  ```ts
  io.use((socket, next) => {
    const user = verifyJwt(socket.handshake.auth.token); // libs/auth — shared w/ REST
    if (!user) return next(new Error('unauthorized'));
    socket.data.user = user;
    next();
  });
  ```

- Angular client logs in via REST → gets JWT → passes it to the socket connection.
- **Upgrade path to SSO:** swap `verifyJwt` to validate an external IdP's token (JWKS).
  Same call sites, same socket middleware — a swap, not a rewrite.

---

## Rough migration order (lowest risk first)

1. **Scaffold Nx workspace** + create `apps/main-api`, `apps/realtime`, empty `libs/`.
2. **`libs/shared` first** — move schemas/types/mappers in, delete the duplicates.
3. **`libs/db`** — central Mongo connection + repositories.
4. **Migrate `realtime` to Nest** (it's tiny: just `server.ts` + socket.io). Learn the
   Nest + `@nestjs/websockets` + socket-auth patterns on the small service.
5. **`libs/auth`** — extract jwt verify + guards + socket middleware; wire into realtime.
6. **Rewrite `main-api` thin** — controllers → domain logic only; validation via pipes,
   mapping via interceptors, swagger auto-gen. Move login/token-issue here, use `libs/auth`.
7. **`libs/common`** — pull shared pipes/filters/interceptors as they emerge.

> `main-api` is last on purpose — it's the biggest rewrite. Realtime + libs prove the
> patterns before we touch it.

---

## Deploy (stays microservices)

- Nx builds each app separately → `dist/apps/main-api`, `dist/apps/realtime`.
- Each app gets its **own Dockerfile / build target** → own image → own container.
- `docker-compose.yml` barely changes: same two services, same ports (3010/3011),
  just a different build `context` (repo root) + per-app target.
- Watch out: naive monorepo Docker build copies whole repo per image — use multi-stage
  builds / Nx affected, or `nx-container`, to keep images lean.

## Loose ends to decide while building

- Mongo access pattern: keep native `mongodb` driver in `libs/db`, or adopt Mongoose/an ODM?
- Token shape + refresh strategy (even pre-SSO, decide refresh now to avoid rework).
- Submodule → subfolder migration: how to collapse the two backend submodules cleanly
  (preserve history vs. fresh import).
