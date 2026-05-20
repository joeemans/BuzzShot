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

## Required Environment

Set `TMDB_READ_ACCESS_TOKEN` in `.env` for live TMDB-backed discovery. `TMDB_API_KEY` is also supported as a fallback. The frontend never calls TMDB directly.

TMDB-backed API surfaces include trending, movie/series lists, multi-search, genres, configuration, and rich detail pages with appended credits, videos, similar titles, and TMDB recommendations.

## Quality Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter web test:e2e
```
