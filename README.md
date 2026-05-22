# BuzzShot V2

BuzzShot is a social movie and series discovery platform. Users can browse TMDB-powered media, rate and review titles, manage watchlists and custom lists, follow other users, view activity, and receive personalized recommendations.

## Stack

- `pnpm` monorepo
- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Vitest, Playwright
- `apps/api`: NestJS, Prisma, PostgreSQL, Redis, JWT auth, secure refresh-token cookies
- `packages/shared`: shared types, schemas, and constants

## Getting Started

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres redis
pnpm --filter api prisma:migrate:dev
pnpm --filter api db:seed
pnpm dev
```

Web runs on `http://localhost:3000`.
API runs on `http://localhost:4000/api`.

## Docker Compose

Run the full local stack with web, API, PostgreSQL, and Redis:

```bash
cp .env.example .env
docker compose up --build
```

The Compose stack exposes:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Persistent named volumes are mounted for PostgreSQL data, Redis append-only data, and future API file storage. The API container runs Prisma migrations before starting.

## Required Environment

Set `TMDB_READ_ACCESS_TOKEN` in `.env` for live TMDB-backed discovery. `TMDB_API_KEY` is also supported as a fallback. The frontend never calls TMDB directly.

TMDB-backed API surfaces include trending, movie/series lists, multi-search, genres, configuration, and rich detail pages with appended credits, videos, similar titles, and TMDB recommendations.

For Google auth, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`. The callback should point to the API route, for example `http://localhost:4000/api/auth/google/callback`.

Auth data is persisted in PostgreSQL through Prisma. Refresh tokens are stored only as hashes in the database and the raw token stays in the HttpOnly cookie.

For production, set `NODE_ENV=production`, `COOKIE_SECURE=true`, HTTPS `API_URL`/`WEB_URL`, and a unique high-entropy `JWT_ACCESS_SECRET` of at least 32 characters. The API validates these settings at startup and rejects the development JWT secret in production.

## Implemented V1 Surfaces

- Auth: register, login, Google OAuth, refresh rotation, logout, logout all, current user, password reset token generation, password reset confirmation, and password change.
- Media: TMDB discovery/detail routes with Redis and PostgreSQL cache fallback, BuzzShot rating/review aggregates, and viewer media state.
- Social: ratings, reviews, review likes/comments, watchlist, watched, favorites, custom lists, list likes/comments/follows, user follows, notifications, activity feed, grouped search, and deterministic `/for-you` recommendations.
- Web: persisted detail-page actions, per-title list add/remove controls, searchable list item management, review submission, collections, follow buttons, notification tab, feed, list creation/item additions, and profile/account/security settings.

## Quality Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter web test:e2e
```
