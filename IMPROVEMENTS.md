# Improvements & Rules of Thumb

This file is a simple guide for how we build backend features in this repo.
It has three parts:

1. What we already fixed
2. What is still pending
3. How to think while building the next feature

Keep this file updated as we go.

---

## 1. What we fixed (done)

### 1.1 Model name moved to env

**Before:** the model was hardcoded inside the service.

```ts
model: "gemini-3.5-flash-lite",
```

**After:** it comes from config.

```ts
// packages/env/src/server-env.ts
GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),

// apps/server/src/modules/llm/llm.service.ts
model: serverEnv.GEMINI_MODEL,
```

**Why:** changing the model is a settings change, not a code change. It should not need a deploy.

---

### 1.2 Validation moved out of the controller

**Before:** every controller did `schema.parse(req.body)` itself.

**After:** a small middleware does it once, in the route.

```ts
// middlewares/validate.middleware.ts
export const validateBodyMiddleware = <T>(schema: ZodType<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
};
```

```ts
// triage.route.ts
triageRouter.post(
  "/triage",
  validateBodyMiddleware(emailInputSchema),
  triageController.classify,
);
```

**Why:** controllers stay short, and every route gets the same check for free.

---

### 1.3 One response shape

**After:** success and error responses look the same.

```ts
// lib/http/index.ts
export const ok = <T>(res: Response, data: T, message = "Ok") =>
  res.status(200).json({ status: 200, data, message, error: null });

export const created = <T>(res: Response, data: T, message = "Created") =>
  res.status(201).json({ status: 201, data, message, error: null });
```

```json
// success
{ "status": 200, "data": { "category": "WORK" }, "message": "Email triage completed", "error": null }

// error
{ "status": 502, "data": null, "message": "Email Triage Failed", "error": { "code": "FAILED", "message": "Email Triage Failed", "details": null } }
```

**Why:** the frontend only needs to understand one shape.

---

### 1.4 Removed useless try/catch

**Before:**

```ts
try {
  return await doThing();
} catch (error) {
  throw error; // does nothing
}
```

**After:** just call it. Express 5 sends the error to the error middleware automatically.

```ts
const data = await triageService.classify(req.body);
return ok(res, data, "Email triage completed");
```

**Rule:** only use `try/catch` if you are going to *do* something with the error.

---

### 1.5 Safe JSON parsing from the LLM

**Before:** `JSON.parse(res.data)` could crash on markdown fences or bad output.

**After:** clean it, then parse, and throw a clear error if it fails.

```ts
const parseModelJson = (raw: string): unknown => {
  const cleaned = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AppError("Model returned invalid JSON", 502, "FAILED");
  }
};
```

**Why:** bad model output becomes a clean `502`, not a mysterious `500`.

---

### 1.6 Service returns data, not an HTTP wrapper

**Before:** `return { data, message: "..." }`.

**After:** the service returns just the domain object; the controller wraps it.

```ts
// service
return emailClassificationResponseSchema.parse(normalized);

// controller
return ok(res, data, "Email triage completed");
```

**Why:** services can be reused from a cron job or worker without HTTP baggage.

---

### 1.7 Normalizing LLM output

```ts
const toUpperEnum = (value: unknown): string | undefined =>
  typeof value === "string" ? value.trim().toUpperCase() : undefined;

const normalize = (raw: Record<string, unknown>) => ({
  ...raw,
  category: toUpperEnum(raw.category),
  priority: toUpperEnum(raw.priority),
  suggestedTone: toUpperEnum(raw.suggestedTone) ?? "NONE",
  actionItems: Array.isArray(raw.actionItems) ? raw.actionItems : [],
  deadlines: Array.isArray(raw.deadlines) ? raw.deadlines : [],
});
```

**Why:** the model may return `" work "` or a number instead of a string. We clean it before checking it.

---

### 1.8 Error middleware cleaned up

- Zod errors use `err.issues` (not `JSON.parse(err.message)`).
- Prisma codes are mapped: `P2002` → `ALREADY_PRESENT`, `P2025` → `NOT_FOUND`, other → `CONFLICT`.
- `meta` is `unknown` instead of `any`.
- Response shape matches `ok()`.

---

### 1.9 Input size limit

```ts
// packages/schemas/src/email.ts
body: z.string().max(20_000),
```

**Why:** one huge email can blow the prompt size, cost, and latency.

---

## 2. What is pending

### Important (do soon)

| Item | Where | Why |
| --- | --- | --- |
| Create the LLM client once, not per request | `llm.service.ts:212` | saves time and memory |
| Use Gemini JSON mode (`responseMimeType` + `responseSchema`) | `llm.service.ts:214` | model can't return broken JSON |
| Add timeout + one retry | `llm.service.ts` | a slow call should not hang the request |
| Add logging back | `error.middleware.ts` | right now errors are silent |

**Example — LLM client once:**

```ts
// top of the file
const gemini = new GoogleGenAI({ apiKey: serverEnv.GEMINI_API_KEY });

// inside the function
const response = await gemini.models.generateContent({ ... });
```

---

### Cleanup (later)

- Remove `Router as Router` casts in `triage.route.ts` and `version.route.ts`.
- Make `req.body` typed after validation (no `any`).
- Fix `auth.middleware.ts:23`: it passes `undefined` as the error code.
- Auth middleware returns a custom error shape and logs `session.user` (personal data).
- Move the big prompt into its own file, e.g. `modules/llm/triage.prompt.ts`.
- Add `.env.example` with `GEMINI_MODEL`.
- Add `express.json({ limit: "1mb" })` explicitly.
- Validate `query` and `params`, not only `body`.
- Add tests for `normalize` and `parseModelJson`.

---

### Later (feature work)

- Save results to the database (`EmailAnalysis`) using `upsert`.
- Add rate limiting on `/triage`.
- Add request IDs so logs can be traced.
- Add a health check.
- Re-add the email module (currently stashed).

---

## 3. How to think while building

### The three jobs

Think of the backend as three workers:

1. **Controller = receptionist.**
   Takes the request, calls one service, gives back a clean reply. Does no real work.

2. **Service = worker.**
   Does the real work: rules, database, calling Gemini. It does not know about HTTP.

3. **Lib = outside helper.**
   One job each (Gemini, Gmail, mail). Only talks to the outside world.

### The four habits

1. **Check input at the door.**
   Validate once at the route. After that, trust it.

2. **Don't trust outsiders.**
   Gemini and Gmail can send anything. Check and clean before using.

3. **One place for errors.**
   Throw one clear `AppError` with the right status code. Let the middleware format it.

4. **Config lives in env.**
   If it can change without code (model, URL, timeout), put it in `.env`.

### Build order for a new feature

1. **Contract first.** Define input schema and output type in `@repo/schemas`.
2. **Service shape.** Write the function signature: typed input in, typed data out.
3. **Service body.** Do the work and validate outside data.
4. **Controller.** Three lines: call service, wrap with `ok()`.
5. **Route.** Add `validateBodyMiddleware(schema)` and auth.
6. **Test the service.**

### Where does this code go?

Ask yourself:

> "If a cron job called this instead of a user, would it still make sense?"

- **Yes** → it belongs in the service.
- **No** (needs `req`, `res`, status codes) → it belongs in the controller.

### Small complete example

> This `notes` example is fictional (it does not exist in the repo). It is only here to show the pattern.

```
modules/notes/
  notes.route.ts
  notes.controller.ts
  notes.service.ts
```

```ts
// notes.route.ts
import { Router } from "express";
import { noteInputSchema } from "@repo/schemas";
import { validateBodyMiddleware } from "../../middlewares/validate.middleware";
import { notesController } from "./notes.controller";

export const notesRouter = Router();

notesRouter.post(
  "/notes",
  validateBodyMiddleware(noteInputSchema),
  notesController.create,
);
```

```ts
// notes.controller.ts
import { Request, Response } from "express";
import { created } from "../../lib/http";
import { notesService } from "./notes.service";

export const notesController = {
  create: async (req: Request, res: Response) => {
    const note = await notesService.create(req.body);
    return created(res, note, "Note created");
  },
};
```

```ts
// notes.service.ts
import { noteInputSchema, NoteInputType } from "@repo/schemas";
import { prisma } from "@repo/db";
import { AppError } from "../../middlewares/error.middleware";

export const notesService = {
  create: async (input: NoteInputType) => {
    const parsed = noteInputSchema.parse(input);

    const note = await prisma.note.create({ data: parsed });
    if (!note) {
      throw new AppError("Could not create note", 500, "FAILED");
    }

    return note;
  },
};
```

Notice:
- Route only wires things.
- Controller only calls the service and wraps the response.
- Service has the logic and throws `AppError`.
- No `res` or HTTP code inside the service.

---

## 4. Quick checklist (copy this for every feature)

- [ ] Input schema added in `@repo/schemas`
- [ ] Service returns a typed domain object
- [ ] Service validates/normalizes outside data
- [ ] Controller is thin and uses `ok()` / `created()`
- [ ] Route uses `validateBodyMiddleware`
- [ ] Errors use `AppError` with the right status
- [ ] Config values are in env, not hardcoded
- [ ] No PII in logs
- [ ] `pnpm check-types` and `pnpm build` pass

---

## 5. One-line rule

> Validate at the door, keep controllers dumb, keep services pure, wrap only at the edge, and make every external failure a typed `AppError` with a cause.
