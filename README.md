# AI Affiliate OS

AI-powered affiliate operating system built with Next.js + TypeScript + Tailwind + Supabase.

## Start
1. Install Node.js LTS.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill Supabase + AI values.
4. Apply Supabase migrations in `supabase/1_initial_schema.sql` (`supabase migration up` or SQL editor).
5. Run `npm run dev`.

## Commands
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run test` — Vitest
- `npm run build` — Next.js production build

## Structure
- `app/` — Next.js App Router pages + API routes (`app/api/health`, `app/api/n8n`)
- `agents/` — 11 AI agents + orchestrator (CEO, Trend, Product Research, Product Scoring, Finance, Content, Creative, Compliance, Evaluator, Experiment, Memory)
- `domain/` — typed domain services (Product, Trend, Content, Creative, Performance, Finance, Compliance, Approval)
- `lib/` — audit logger, demo seed data
- `supabase/` — Postgres schema with RLS

## Rules
- Human-in-the-loop: no publishing or spending without approval (see `domain/approval.service.ts`, publishing gate in WORKFLOWS).
- Never commit `.env.local` or secrets.
- Supabase publishable key may be client-side; secret key server-only.
- Demo mode works without paid APIs (mock adapters everywhere).
- AI outputs affecting business actions are logged (`lib/audit.ts`, `ai_decisions`, `agent_runs`).

## Limitations
- Supabase Auth/DB requires real project credentials; without them the app runs on mock/demo data.
- n8n routes are stubs until `N8N_BASE_URL` + `N8N_WEBHOOK_SECRET` are configured.
- No autonomous posting until a provider is configured and the user enables it.
