# Improvements & Rules of Thumb

How we build backend features in this repo. Keep it short and keep it updated.

---

## 1. Already done

- **Config in env** — Gemini model and other settings live in `@repo/env`, not in code.
- **Validation at the route** — `validateBodyMiddleware(schema)` parses once; controllers don't.
- **One response shape** — `okResponse` / `createdResponse` / `errorResponse` in `lib/http`.
- **Clean errors** — `AppError` everywhere; the error middleware maps Zod and Prisma codes.
- **No useless `try/catch`** — Express 5 forwards rejected promises to the error middleware.
- **Safe LLM output** — strip markdown fences, `JSON.parse`, then `normalize` + zod schema.
- **Input limits** — email body capped at 20k chars in `@repo/schemas`.
- **Gmail** — OAuth tokens stored, messages parsed and persisted, manual sync, token refresh saved, revoked accounts marked `DISCONNECTED`, `GET /v1/accounts`.

---

## 2. Pending

### Do soon

- Create the Gemini client once, not per request.
- Use Gemini JSON mode (`responseMimeType` + `responseSchema`).
- Add a timeout + one retry for LLM calls.
- Trigger initial sync when an account connects.
- Add `historyId` incremental sync (`users.history.list`).
- Add logging in the error middleware.

### Later

- Gmail actions (drafts, labels, archive, read/unread, send) with approval + audit trail.
- Disconnect / revoke account and delete its data.
- Reduce scopes to `gmail.readonly` until actions exist.
- Background jobs (Redis + BullMQ), push notifications (`users.watch`).
- Tests for parser, sync, `normalize`, `parseModelJson`.
- Request IDs, health check, rate limiting.
- Remove `Router as Router` casts; type `req.body` after validation.
- Validate `query` and `params`, not only `body`.

---

## 3. Where code goes

Decide by **what the code touches**, not by length.

### Four questions

1. Touches `req`/`res`, status codes, query, cookies? → **controller**
2. Talks to an outside system (Google, Gemini, SMTP, another API)? → **lib**
3. Queries Prisma, applies rules, decides what to select/filter/write? → **service**
4. Only wires a URL + middleware to a handler? → **route**

None of these? It's a helper — keep it next to its only user.

### Rules per file

| File               | Owns                                                   | Must not do                             |
| ------------------ | ------------------------------------------------------ | --------------------------------------- |
| `*.route.ts`       | paths, `authMiddleware`, validation                    | query DB, call Google, format responses |
| `*.controller.ts`  | read `req`, call one service method, wrap response     | Prisma, loops, decisions, external APIs |
| `*.service.ts`     | Prisma, business rules, shaping, orchestration         | import express, touch `req`/`res`       |
| `lib/<provider>/*` | credentials, SDK setup, one function per external call | product decisions, response envelopes   |

`AppError` is shared: services may throw it; route/controller/middleware don't translate it.

### Reallocation habit

Write it in the service first, then move lines:

- Mentions HTTP (`req`, `res`, `.status`, `okResponse`)? → **up to controller**.
- Calls Google/Gemini/SMTP? → **down to lib**.
- Everything left is genuinely service.

Examples:

- **`GET /emails`** — route: path + auth · controller: parse query, call `service.list`, respond · service: `prisma.email.findMany({ where: { userId } })` · lib: none.
- **Sync** — route: path + auth · controller: call `service.sync` · service: orchestrate + persist · lib: `gmailConnect` + raw Google calls.

`lib/google-gmail/sync.ts` mixes lib and DB writes today. Fine for now; split fetch (lib) from persist (service) when it grows.

### Creating files

- New endpoint on an existing thing → add a controller method + service method.
- New resource/domain → `modules/<name>/` with route, controller, service.
- New external provider → `lib/<provider>/`.
- New request shape → schema in `@repo/schemas`, used by route middleware.
- New shared type → beside its owner. No global `types/` dump except cross-cutting types like `http.type.ts`.

**Rule:** route is a map, controller is a translator, service is the product, lib is the outside world. If a file does two jobs, split it.

---

## 4. New feature checklist

- [ ] Input schema in `@repo/schemas`
- [ ] Service takes typed input, returns typed data (no HTTP)
- [ ] Outside data validated/normalized before use
- [ ] Controller is thin and uses `okResponse`/`createdResponse`
- [ ] Route uses `validateBodyMiddleware` and `authMiddleware`
- [ ] Failures throw `AppError` with the right status/code
- [ ] Secrets and config come from env
- [ ] No PII in logs
- [ ] `pnpm lint` and `pnpm check-types` pass; `pnpm build` when app code changes

---

## 5. One-line rules

- Validate at the door; trust it after.
- Don't trust outsiders (Gemini, Gmail) — parse, validate, normalize.
- Controllers translate; services do the work; libs talk to the outside.
- One error type (`AppError`), one response shape, config in env.
