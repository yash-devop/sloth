<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Sloth — Email Triage Agent

Sloth is an AI email triage agent. This repo is a Turborepo monorepo: `apps/web` is the product app and shared code lives in `packages/*`. Do not modify the managed Turborepo block above.

## Repository layout

```
my-turborepo/
├─ apps/
│  ├─ web/    # product app — Next.js, port 3000
│  └─ server/ # @server — Express API, built with tsup
├─ packages/
│  ├─ db/                 # @repo/db — Prisma 7 client + pg adapter
│  ├─ env/                # @repo/env — env file resolution and schemas
│  ├─ schemas/            # @repo/schemas — shared zod schemas
│  ├─ ui/                 # @repo/ui — shared React components
│  ├─ eslint-config/      # @repo/eslint-config
│  └─ typescript-config/  # @repo/typescript-config
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

- New shared code goes in `packages/<kebab-name>` and is named `@repo/<kebab-name>`; the `packages/*` workspace glob picks it up.
- New apps go in `apps/<kebab-name>`.
- Never duplicate shared logic inside an app — extract it to a package.

## Toolchain

pnpm 11 · Node >= 24 · Turbo 2 · Next.js 16 · React 19 · TypeScript 7 · ESLint 10 · Prettier.

Use pnpm only (no npm/yarn/bun). Run tasks from the repo root:

```sh
pnpm dev            # all apps
pnpm build          # all workspaces, respects ^build
pnpm lint           # eslint, --max-warnings 0
pnpm check-types    # tsc / next typegen
pnpm format         # prettier
pnpm exec turbo run <task> --filter=web
```

- Use `pnpm exec turbo` unless a global `turbo` is installed.
- `apps/server` builds with tsup into `dist/`; `@repo/db`, `@repo/env`, and `@repo/schemas` are consumed as TypeScript source through their package `exports` maps (no build step).
- Prisma lives in `packages/db`; run its scripts with `pnpm --filter @repo/db <script>` (config: `prisma7.config.ts`).
- New tasks must be declared in `turbo.json` (with `dependsOn`, `inputs`, `outputs` as appropriate) before use.
- Read the installed Turbo docs (block above) before changing `turbo.json` or CLI usage.

## Naming: kebab-case everywhere

- Every file and directory is kebab-case: `email-list.tsx`, `use-triage-queue.ts`, `triage-rules.ts`, `email-list.test.ts`.
- Exceptions only for names a framework/tool mandates: `page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`, `next.config.js`, `tsconfig.json`, `package.json`, `README.md`, `AGENTS.md`.
- React components use PascalCase **symbols** in kebab-case **files**: `EmailList` lives in `email-list.tsx`.
- Hooks: `useEmailTriage` in `use-email-triage.ts`.
- Packages: `@repo/<kebab-name>`. Apps: kebab-case folder names.

## Path aliases (required, always start with `@`)

- Never import across directories with relative paths (`../`, `../../`). Only `./sibling` inside the same folder is allowed.
- Workspace packages: `@repo/ui`, `@repo/eslint-config`, `@repo/typescript-config`, `@repo/db`, `@repo/env`, `@repo/schemas`.
- Inside an app, `@/` maps to that app's root:
  - `@/components/email-list`
  - `@/hooks/use-triage-queue`
  - `@/lib/api-client`
- `@repo/ui` exports `./*` → `src/*.tsx`, so import `@repo/ui/button`.
- Any new alias must start with `@`, be declared in the relevant `tsconfig.json` `paths` (plus Next config if needed) before first use, and stay consistent across apps.

## UI components

- Always use components from `@repo/ui` before writing new ones.
- If a component is missing, add the shadcn/ui (base-ui based) implementation under `packages/ui/src/` and export it from the package so apps import it as `@repo/ui/<kebab-name>`.
- If it still isn't available, ask the user instead of inventing a one-off component.
- Use one icon library consistently; do not add a new icon, animation, or UI library without asking.

## Data fetching & errors

- Server state goes through TanStack Query (add the dependency first): typed API calls in `lib/query/api/*`, hooks in `hooks/*`, keys centralized in `lib/query/keys.ts`. Invalidate the relevant keys after mutations.
- Unwrap the API envelope (`{ status, data, message, error }`) in the API layer; components consume typed data, never raw responses.
- Keep components presentational; data intent and mutations live in hooks.
- Surface API failures with the shared toast component; never use `window.alert` or `window.confirm`.
- Render rich/untrusted content through a sanitizer or a safe renderer; never use `dangerouslySetInnerHTML` on email or user content.

## Git

- **Never commit automatically.** Do not run `git add`, `git commit`, `git push`, or any other history-changing command unless the user explicitly asks in the current request. Finishing a task is never implicit permission to commit.
- **"git commit all" / "commit all" means: split the staged changes into logical, grouped commits — never one dump commit.** Each commit must be one coherent unit (a feature, a fix, a config change, docs, a refactor), and each group is staged and committed separately.
- Inspect `git status` and `git diff` before staging; stage only files belonging to that group.
- Conventional Commits: `type(scope): summary` — types `feat|fix|chore|docs|refactor|test|build|ci|perf`; scopes `web|ui|config|repo`.
- Never commit secrets or `.env*`. Do not push unless explicitly asked.
- Only commit when the user explicitly asks.

## Quality gates

- Before finishing: `pnpm lint` and `pnpm check-types` must pass with zero warnings.
- Run `pnpm build` when touching app code, package exports, or build config.
- Keep TypeScript strict; avoid `any` unless unavoidable and justified.

## Code style

- TypeScript everywhere; no JavaScript source files unless a tool requires them.
- Follow existing patterns in neighboring files; reuse existing utilities before adding new ones.
- Prettier owns formatting; don't hand-format.
- Write self-documenting code — add comments only where logic is genuinely non-obvious.
- Reset per-route/component state with `key` remounts instead of `setState` inside `useEffect` (lint enforces `react-hooks/set-state-in-effect`).
- Keep changes type-clean: run the targeted `check-types` and `lint` before finishing.
