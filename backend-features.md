# Backend Features — `myaw-main-api`

Inventory of every **code feature** currently built in `myaw-main-api` (Express) that must be
rebuilt in the new Nx + NestJS `myaw-backend`. Resources/infra (Dockerfiles, env, deploy) are
out of scope — this is the application logic only. See `backend-migration.md` for the target
layout and where each of these should land (`apps/main-api`, `libs/auth`, `libs/db`, etc.).

## Server / bootstrap

- **Express app bootstrap** — creates the app, applies global CORS, mounts the app router, exposes a root `GET /` health-ping (`"Konnichiwa"`), starts listening and connects to Mongo on boot.
- **Deployment-gated docs** — Swagger UI is only mounted under `/docs` in `Development`.

## Configuration

- **Central config module** — typed config objects for auth (JWT + argon2), CORS, database, logging, server, and field validation, all assembled in one place.
- **Env loader** — `dotenv` load plus `criticalVar` (throws if missing) / `nonCriticalVar` (warns, returns undefined) helpers; single typed `envs` object (port, deployment, Mongo URI/db, JWT secrets/algorithm/issuer/expirations, web-app URL, pretty-print flag).
- **Validation config** — shared min/max length rules for login, password, name, surname, phone.

## Authentication & authorization

- **JWT issuing** — separate access/refresh tokens via `jsonwebtoken`, configurable algorithm/issuer/expiration, payload carries `userId`, `userRole`, `tokenType`, and random `tokenId`/`sessionId`.
- **JWT verification** — verifies signature + issuer per token type, returns normalized token data (incl. issued/expires dates) or `null`.
- **Password hashing** — Argon2 hash + verify with tuned cost params (saltLength, timeCost, memoryCost, parallelism, hashLength).
- **Refresh → access exchange** — `POST /public/access-token` validates a refresh token, re-checks the user exists, issues a fresh access token.
- **Role hierarchy + auth middleware** — `user < admin < super-admin`; middleware enforces `Bearer` header, rejects refresh tokens used for access, gates routes by required role level, and stashes token data on `res.locals`.

## User management

- **Registration** — `POST /public/register`; zod-validated body, uniqueness checks across login/email/phone (parallel), creates user (`Unverified` status, hashed password, personalData + meta), returns access + refresh tokens.
- **Login** — `POST /public/login`; accepts exactly one of login/email/phone + password, verifies password, returns tokens.
- **Get me** — `GET /user/me`; current user from token.
- **Get user by id** — `GET /user/users/:userId`.
- **Search users** — `GET /user/users/search`; case-insensitive login regex, paginated (limit/offset, capped).
- **Lookup by identifier** — `UserService.getUser` resolves a user by login, email, phone, or id (shared by login/register/middleware flows).
- **Admin user management** — `GET /admin/users` (filters: role/status/login/email, paginated, sorted by registration date), `GET /admin/users/:userId`, `PATCH /admin/users/:userId` (update login/password/role/status/personalData; re-hashes password on change).

## Social graph — connections

- **Pair normalization** — deterministic `userA`/`userB` ordering so a pair has one canonical record.
- **Connection tiers** — `connected (1) < friendship (2) < close-friend (3)`.
- **List connections** — `GET /user/connections`; optional type filter, paginated, sorted by `updatedAt`.
- **Upsert / set type** — create-or-update a connection at a given tier (used when accepting requests).
- **Downgrade connection** — `PATCH /user/connections/:targetUserId`.
- **Per-side custom labels** — `PATCH /user/connections/:targetUserId/label`; each user can label the other independently (`customLabel.userA` / `.userB`).
- **Remove connection** — `DELETE /user/connections/:targetUserId`.

## Social graph — connection requests

- **Create request** — `POST /user/connection-requests`; records requester, target, and desired connection type.
- **List requests** — `GET /user/connection-requests`; incoming (pair member, not requester) and outgoing (requested-by-me) queries, paginated.
- **Accept request** — `POST /user/connection-requests/:requestId/accept`; validates participant, blocks self-accept, upserts the connection, deletes the request.
- **Delete / cancel request** — `DELETE /user/connection-requests/:requestId`.

## Social graph — relations (block / ignore)

- **Relation types** — `block`, `ignore` (directional `from → to`).
- **Create relation** — `POST /user/relations`.
- **List relations** — `GET /user/relations`; from-user and to-user queries, optional type filter, paginated.
- **Remove relation** — `DELETE /user/relations/:targetUserId/:type`.

## Persistence

- **MongoDB service** — singleton client, connect-with-retry/backoff, ping healthcheck, lazy `getDB`, auto-null on topology close (reconnect on next use), and an `ensureIndexes` mechanism with per-collection index definitions (currently scaffolded/commented).
- **Collection registry** — `MongoDBCollectionEnum` (users, chats, messages, userConnections, userConnectionRequests, userRelations, logs).
- **Redis service** — empty stub class (placeholder, not yet implemented).

## Shared DTO / mapping layer

- **Incoming/outgoing DTOs** — typed request inputs and response shapes.
- **Mappers** — `user`, `user-connection`, `user-relation` map DB entities → response DTOs; connection mapper is **perspective-aware** (`toDto(connection, viewerId)`), user mapper has a `toPublic` projection. *(In the new monorepo these wire DTOs should come from `@myaw/contracts`.)*

## Error handling

- **AppError hierarchy** — abstract base + `Validation` (400), `Authentication` (401), `Authorization` (403), `NotFound` (404), `Conflict` (409), `Internal` (500); each carries `statusCode`, `errorMessageCode`, `logLevel`, optional `details`.
- **Central error handler** — normalizes JSON parse errors to `ValidationError`, logs via `LoggerUtil`, returns structured `{ error: { message, errorMessageCode, details? } }`, hides internals in production (full message only in dev).
- **Error code enum** — stable machine-readable `errorMessageCode`s returned to clients.

## Logging

- **Request logger middleware** — times each request, picks log level from status (≥500 error, ≥400 warn, else info), captures method/path/status/duration/ip/userAgent/userId.
- **LoggerUtil** — colorized console output (method/status coloring) **and** persistence of request + error logs to the Mongo `logs` collection; persistence failures are swallowed so logging never breaks the request.
- **ANSI coloring util** — `formatString` with color/background/style enums.
- **Logs schema** — request and error log entry shapes.

## API documentation

- **Hand-written OpenAPI specs** — per-audience specs (public, user, admin, super-admin) with shared components, served as JSON.
- **Swagger UI** — `swagger-ui-express` multi-spec explorer mounted at `/docs` (dev only).

## Not yet built (domain scaffolding only — flag for migration)

- **Chat & messaging** — `chats` / `messages` collections, `ChatSchema`, `MessageSchema` (message types + reactions + soft-delete) and related types **exist**, but there are **no services, controllers, or routes**. Messaging is unimplemented in `main-api`; treat it as planned domain, not a feature to port.
- **Super-admin routes** — router exists but is empty (no endpoints).
