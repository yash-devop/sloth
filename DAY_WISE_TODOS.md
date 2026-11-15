# Day-wise TODOs

Scope: backend agent only (drafts + labels, no UI). Target: working by 9–10pm.

You are implementing this yourself. Task order below is slot-wise; ask for help on any task instead of skipping it.

Locked decisions:

- "New" = emails received in the last 24h (not unread).
- `requiresReply` query accepts `"true" | "false"` as a string transform (do not use `z.coerce.boolean()`).
- Label = `Sloth/Promotions` (or `Sloth/Spam` for spam), auto-created in Gmail if missing.
- Draft "To" = email address extracted from the stored `sender` header.
- Out of scope: UI, send, archive, reminder execution.

---

## Slot plan (start 1:00pm)

| Slot | Task | Done check |
| --- | --- | --- |
| 1:00–1:20 | T1 schemas | `pnpm --filter @repo/schemas check-types` |
| 1:20–2:10 | T2 list search + filters | filtered `GET /emails` returns badges |
| 2:10–2:25 | Break | — |
| 2:25–2:50 | T3 inbox summary | counts match DB |
| 2:50–3:30 | T4 threads | ordered messages + merged summary |
| 3:30–3:45 | Checkpoint 1 | `pnpm check-types` + hit 3 endpoints |
| 3:45–4:30 | T5 decision layer | detail returns `suggestedActions` |
| 4:30–5:00 | T6 Prisma model | generate + db push succeed |
| 5:00–5:15 | Break | — |
| 5:15–6:15 | T7 Gmail tools | draft + label visible in Gmail |
| 6:15–7:20 | T8 actions module | create → approve → execute; reject does nothing |
| 7:20–7:40 | T9 wiring + schemas | endpoints reachable behind auth |
| 7:40–8:00 | Break | — |
| 8:00–8:20 | T10a checks | `check-types`, `lint`, `build` clean |
| 8:20–9:00 | T10b E2E | full flow works |
| 9:00–10:00 | Buffer | fixes only, no new scope |

**Cut line 8:00pm:** if Gmail execution still fails, ship T1–T5 + persisted approve/reject and leave tools for next session.

---

## T1 — Extend email query schemas (~20–30m)

Files: `packages/schemas/src/email.ts`

- [ ] Import `emailCategorySchema` and `emailPrioritySchema` into the email schema file.
- [ ] Add an email status enum (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).
- [ ] Add a boolean query helper: `z.enum(["true", "false"]).transform((v) => v === "true")`.
- [ ] Extend `emailListQuerySchema` with `q` (trimmed, 1–200), `category`, `priority`, `requiresReply` (helper, optional), `status`.
- [ ] Add `emailThreadParamsSchema` (`threadId` min 1).
- [ ] Add `emailInboxSummaryQuerySchema` (`gmailAccountId` optional).
- [ ] Export inferred types for the new schemas.

Done when: schema package typechecks and a quick parse of `{ requiresReply: "false" }` gives `false`.

---

## T2 — Search + filters in email list (~45–60m)

Files: `apps/server/src/types/email.type.ts`, `apps/server/src/modules/email/email.service.ts`

- [ ] Add `TEmailListAnalysis` with `category`, `priority`, `requiresReply`, `summary`, `deadlines`.
- [ ] Add `emailAnalysis: TEmailListAnalysis | null` to `TEmailSummary`.
- [ ] In `list`, build a Prisma `where` with `userId` and optional `gmailAccountId` / `status`.
- [ ] Search: when `q` is present, OR across `subject`, `sender`, `snippet` with `contains` + `mode: "insensitive"`.
- [ ] Analysis filters: when any of `category` / `priority` / `requiresReply` is present, use one `emailAnalysis: { is: { ... } }` block (do not create separate relation filters).
- [ ] Add the analysis badge fields to the `select`.
- [ ] Keep `receivedAt: "desc"` and `take: limit`.

Done when: `GET /emails?q=invoice&category=FINANCE&requiresReply=true` returns only matches, each with analysis badges.

---

## T3 — Inbox summary (~30m)

Files: `email.service.ts`, `email.controller.ts`, `email.route.ts`

- [ ] Add `summary(userId, { gmailAccountId })` using `Promise.all` of four `prisma.email.count` calls.
- [ ] `new`: `receivedAt >= now - 24h`.
- [ ] `important`: analysis priority in `URGENT` / `HIGH`.
- [ ] `needsReply`: analysis `requiresReply = true`.
- [ ] `withDeadlines`: analysis `deadlines` not empty (`isEmpty: false`).
- [ ] Add controller handler and `GET /inbox/summary` route with `validateQueryMiddleware(emailInboxSummaryQuerySchema)`.

Done when: returned counts match the rows in the DB for a synced account.

---

## T4 — Thread understanding (~45m)

Files: `email.service.ts`, `email.controller.ts`, `email.route.ts`, `types/email.type.ts`

- [ ] Add `TEmailThread` type: `threadId`, `messages`, `combined`.
- [ ] Add `getThread(userId, threadId)`: messages for user + thread, ordered `receivedAt asc`, with analysis.
- [ ] Throw `AppError("Thread not found", 404, "NOT_FOUND")` when empty.
- [ ] `combined`: latest non-null analysis summary, union of `actionItems`, union of `deadlines` (de-duplicate).
- [ ] Add `GET /threads/:threadId` route with `validateParamsMiddleware(emailThreadParamsSchema)`.

Done when: a multi-message thread returns every message in order plus merged fields.

---

## T5 — Agent decision layer (~45–60m)

Files: new `apps/server/src/modules/agent/decide.ts` and `decide.type.ts`; wire into `email.service.ts`

- [ ] Define `SuggestedAction`: `type`, `label`, `reason`, `executable`, optional `payload` (`labelName`).
- [ ] Types: `CREATE_REPLY_DRAFT`, `APPLY_LABEL`, `ARCHIVE`, `PRIORITY_INBOX`, `CREATE_REMINDER`.
- [ ] `deriveSuggestedActions(analysis)` is pure: no DB, no side effects, returns `[]` for null.
- [ ] Rule: `requiresReply && replyDraft` → `CREATE_REPLY_DRAFT` (executable).
- [ ] Rule: `PROMOTIONS` / `SPAM` → `APPLY_LABEL` (executable); label `Sloth/Promotions` or `Sloth/Spam`.
- [ ] Rule: `deadlines.length > 0` → `CREATE_REMINDER` (not executable).
- [ ] Rule: priority `URGENT` / `HIGH` → `PRIORITY_INBOX` (not executable).
- [ ] Add `suggestedActions` to `TEmailDetail` and compute it inside `getEmail`.

Done when: `GET /emails/:id` returns suggested actions that match the analysis.

---

## T6 — AgentAction DB model (~30m)

Files: new `packages/db/prisma/agent-action.prisma`; add back-relations in `schema.prisma` (`User`), `email.prisma` (`Email`), `account.prisma` (`GmailAccount`)

- [ ] Enums: `AgentActionType` (`CREATE_REPLY_DRAFT`, `APPLY_LABEL`), `AgentActionStatus` (`PENDING`, `APPROVED`, `REJECTED`, `EXECUTED`, `FAILED`).
- [ ] `AgentAction` fields: `id`, `type`, `status`, `reason?`, `payload Json`, `result Json?`, `error?`, `approvedAt?`, `rejectedAt?`, `executedAt?`, `createdAt`, `updatedAt`, `userId`, `emailId`, `gmailAccountId`.
- [ ] Relations to `User`, `Email`, `GmailAccount` with cascade delete.
- [ ] Indexes: `[userId, status]` and `[emailId]`; map to `agent_action`.
- [ ] Run `pnpm prisma:generate` and `pnpm prisma:dev` (compose must be up).

Done when: generated client includes `AgentAction` and `pnpm prisma:dev` finishes without error.

---

## T7 — Gmail action tools (~60m)

Files: new `apps/server/src/lib/google-gmail/actions.ts` (+ type file)

- [ ] `buildRawMessage`: sanitize header newlines, set `To`, `Subject` (`Re: ` prefix once), `MIME-Version`, `Content-Type: text/plain; charset=UTF-8`, blank line, body; encode base64url.
- [ ] `createReplyDraft(gmailClient, { to, subject, threadId, body })` via `users.drafts.create`, include `threadId` when present.
- [ ] `applyLabel(gmailClient, { messageId, labelName })`: list labels, create if missing (in-process cache), then `users.messages.modify` with `addLabelIds`.
- [ ] On `invalid_grant`, call existing `markAccountDisconnected` and throw a clear `AppError`.
- [ ] Return IDs useful for the action audit (`draftId`, `messageId`, `labelId`).

Done when: a real connected account gets a draft and a `Sloth/Promotions` label; second run reuses the cached label.

---

## T8 — Agent actions module (~60–75m)

Files: new `apps/server/src/modules/agent/{agent.service,agent.controller,agent.route,agent.service.type}.ts`

- [ ] `create(userId, emailId, input)`: verify email ownership; 404 if missing.
- [ ] For `CREATE_REPLY_DRAFT`: require `analysis.replyDraft` (400 `INVALID` if absent); payload = `{ to, subject, threadId, body }`, `to` extracted from sender header.
- [ ] For `APPLY_LABEL`: payload = `{ messageId: gmailMessageId, labelName }`; default label by category.
- [ ] Insert action with `status: PENDING` and optional `reason`.
- [ ] `list(userId, { status, emailId })`: newest first, cap at 100.
- [ ] `approve(userId, id)`: guarded update `where { id, userId, status: PENDING }` → `APPROVED` + `approvedAt`; 404 if not found, 409 if not pending.
- [ ] Execute after approval with the stored account tokens; success → `EXECUTED` + `executedAt` + `result`; failure → `FAILED` + `error`, then surface a 502.
- [ ] `reject(userId, id)`: guarded `PENDING` → `REJECTED` + `rejectedAt`.
- [ ] Never execute a non-approved action; keep every transition on the row.

Done when: create → approve produces a Gmail draft/label; reject changes nothing in Gmail; another user's IDs return 404.

---

## T9 — Wiring & schemas (~20m)

Files: new `packages/schemas/src/agent.ts`, `packages/schemas/src/index.ts`, `apps/server/src/modules/version.route.ts`

- [ ] Schemas: action type, action status, action id param, create body (`type`, optional `labelName`, optional `reason`), list query (`status`, `emailId`).
- [ ] Export the new schemas/types from the package index.
- [ ] Mount `agentRouter` behind `authMiddleware` under `/v1`.
- [ ] Routes: `GET /actions`, `POST /emails/:id/actions`, `POST /actions/:id/approve`, `POST /actions/:id/reject`.

Done when: all four endpoints are reachable and reject unauthenticated calls.

---

## T10 — Verification (~60m)

- [ ] `pnpm compose:up`
- [ ] `pnpm prisma:generate` then `pnpm prisma:dev`
- [ ] `pnpm check-types`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] E2E with a logged-in session cookie:
  - [ ] `POST /emails/sync` and `POST /emails/analyze`
  - [ ] `GET /emails?category=WORK&requiresReply=true`
  - [ ] `GET /inbox/summary`
  - [ ] `GET /emails/:id` → confirm `suggestedActions`
  - [ ] `GET /threads/:threadId`
  - [ ] `POST /emails/:id/actions` with `CREATE_REPLY_DRAFT`
  - [ ] `GET /actions?status=PENDING`
  - [ ] `POST /actions/:id/approve` → confirm Gmail draft
  - [ ] Repeat with `APPLY_LABEL` → confirm label in Gmail

---

## Carry-over (not tonight)

- [ ] Encrypt OAuth tokens at rest
- [ ] Incremental `historyId` sync
- [ ] Push notifications (`users.watch` + Pub/Sub)
- [ ] Tests: parser, sync, `normalize`, `parseModelJson`, `deriveSuggestedActions`
- [ ] Error middleware logging, request IDs, health check, rate limiting
- [ ] Fix worker `resetStuckEmails` (currently resets all users' `PROCESSING` rows on boot)
- [ ] Web app: auth/onboarding → inbox → email detail → priority inbox / inbox zero → search → actions UI
- [ ] Advanced: NL inbox queries, daily briefing, follow-up detection, calendar/reminders, custom rules
- [ ] Production: observability, billing, retention/deletion workflows
