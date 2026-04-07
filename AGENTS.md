# AGENTS Guide

This file gives coding agents a concise and reliable workflow for this repository.

## Scope

- Frontend: Angular 18 app (standalone components) in `src/`
- Optional local backend for development: Fastify API in `api/`
- Optional local database: MariaDB via Docker Compose

## Repository map

- `src/app/core`: shared services, guards, interceptors
- `src/app/shared`: reusable UI and shared pages
- `src/app/features`: feature areas (reviews, auth, blog, admin)
- `src/environments`: environment configuration
- `api/`: local backend and DB migrations
- `docs/`: local development and integration docs

## Baseline requirements

- Node.js `>= 18.19`
- npm (lockfile is committed, prefer npm over other package managers)
- Docker (only when using local DB)

## Useful commands

Run from repository root unless noted.

- Install dependencies: `npm install`
- Start frontend dev server: `npm start` (or `npm run dev`)
- Lint: `npm run lint`
- Unit tests: `npm test`
- CI-like test run: `npm run test:ci`
- Coverage: `npm run test:coverage`
- Production build: `npm run build:prod`
- Full local check: `npm run check`

Optional local API/DB workflow:

- Start DB: `npm run db:up`
- Stop DB: `npm run db:down`
- Start API (in `api/`): `npm run dev:api`
- Run DB migrations (in `api/`): `npm run db:migrate`

## Coding rules for agents

- Follow `CODING_STANDARDS.md` as source of truth.
- Keep all code and code comments in English.
- Use TypeScript strict typing; avoid `any`.
- Prefer Angular standalone components and `ChangeDetectionStrategy.OnPush`.
- Prefer path aliases (`@core/*`, `@shared/*`, `@features/*`, `@environments/*`) over deep relative paths.
- Use reactive patterns with RxJS; clean up subscriptions (`takeUntil` pattern) when needed.
- Keep edits minimal and focused; do not refactor unrelated areas.

## Editing and architecture guidance

- Place new feature code under the relevant `src/app/features/<feature>/` area.
- Put reusable primitives in `src/app/shared`.
- Put cross-cutting services/guards/interceptors in `src/app/core`.
- Keep environment-specific API configuration in `src/environments`.
- Avoid introducing new dependencies unless required by the task.

## Validation checklist before finishing

1. Run lint on touched code: `npm run lint`
2. Run focused tests for impacted behavior (at minimum `npm run test:ci` for non-trivial changes)
3. Run `npm run build:prod` when changes affect build/runtime integration
4. Update documentation when behavior or commands changed
5. Ensure no secrets or environment-specific credentials are committed

## PR checklist for agents

- Use a clear, scoped title with intent (`feat:`, `fix:`, `docs:`, etc.)
- Summarize user-visible impact and technical changes
- List validation steps executed locally
- Mention risks, follow-ups, or known limitations if applicable

## References

- `README.md`
- `DEVELOPER_GUIDE.md`
- `CODING_STANDARDS.md`
- `ARCHITECTURE.md`
- `docs/LOCAL_DEV.md`
- `API.md`
- `docs/API_SSO.md`
