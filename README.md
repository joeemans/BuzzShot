# BuzzShot

BuzzShot is a social movie and series discovery platform. It combines TMDB-powered browsing with community features: ratings, reviews, watchlists, favorites, custom lists, follows, activity feeds, notifications, and personalized recommendations.

The app is built as a full-stack TypeScript monorepo. The web app talks to the BuzzShot API, and the API handles TMDB requests, authentication, persistence, caching, and private user data.

## Features

- Browse trending, popular, top-rated, upcoming, and currently airing titles.
- Search movies, series, users, reviews, and lists.
- Open rich media pages with cast, crew, trailers, images, similar titles, and recommendations.
- Create an account with email/password auth and rotating HttpOnly refresh cookies.
- Rate, review, like, comment, and track movies or series.
- Manage watchlist, watched items, favorites, and custom lists.
- Follow people and lists, then read a personalized activity feed.
- Cache TMDB responses with Redis and persist longer-lived media cache records in PostgreSQL.

## Tech Stack

BuzzShot uses `pnpm` workspaces:

- `apps/web`: Next.js App Router, React, Tailwind CSS, TanStack Query, React Hook Form, Zod, Vitest, and Playwright.
- `apps/api`: NestJS, Prisma, PostgreSQL, Redis, JWT access tokens, HttpOnly refresh cookies, Helmet, CORS, and environment validation with Zod.
- `packages/shared`: shared TypeScript types, schemas, and constants used by both apps.
- Local services: Docker Compose with PostgreSQL 16 and Redis 7.

## Requirements

- Node.js `22` or newer.
- `pnpm` `10` or newer.
- Docker and Docker Compose.
- A TMDB API Read Access Token for live movie and series data.
- Optional Google OAuth credentials if you want Google sign-in locally.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Update at least these values in `.env`:

```bash
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
TMDB_READ_ACCESS_TOKEN=your-tmdb-read-access-token
```

Start PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
```

Run database migrations and seed data:

```bash
pnpm db:migrate
pnpm db:seed
```

Start the local development servers:

```bash
pnpm dev
```

Open the app at `http://localhost:3000`. The API is available at `http://localhost:4000/api`.

## Docker

You can also run the full local stack with Docker Compose:

```bash
cp .env.example .env
docker compose up --build
```

This starts:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

The API container runs Prisma migrations before startup. PostgreSQL, Redis, and API storage use named Docker volumes, so local data survives container restarts.

## Environment

All local environment values live in the root `.env` file. Prisma commands are wired to load that file, so you do not need a second `.env` inside `apps/api/prisma`.

Important variables:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `REDIS_URL`: Redis connection string used by the API cache.
- `JWT_ACCESS_SECRET`: secret used to sign access tokens.
- `REFRESH_TOKEN_COOKIE_NAME` and `REFRESH_TOKEN_TTL_DAYS`: refresh-session cookie settings.
- `COOKIE_SECURE`: keep `false` for local HTTP development.
- `NEXT_PUBLIC_APP_URL`: local web origin.
- `NEXT_PUBLIC_API_URL`: browser-facing API URL.
- `INTERNAL_API_URL`: server-side API URL used by the Next.js app in Docker.
- `API_URL` and `WEB_URL`: public API and web origins used by the backend.
- `CORS_ORIGINS`: optional comma-separated list of extra allowed frontend origins.
- `TMDB_READ_ACCESS_TOKEN`: preferred TMDB credential.
- `TMDB_API_KEY`: optional TMDB fallback credential.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`: optional Google OAuth configuration.

Do not put TMDB credentials in `NEXT_PUBLIC_*` variables. TMDB calls belong in the API, not in the browser.

## Useful Commands

```bash
pnpm dev          # run web and API in development mode
pnpm build        # build all workspaces
pnpm lint         # run ESLint
pnpm typecheck    # run TypeScript checks
pnpm test         # run unit tests
pnpm db:migrate   # run local Prisma migrations
pnpm db:seed      # seed local data
```

Playwright browser binaries may need to be installed before E2E tests:

```bash
pnpm --filter web exec playwright install
pnpm --filter web test:e2e
```

## Project Structure

```text
apps/
  api/       NestJS API, Prisma schema, auth, TMDB integration, and domain modules
  web/       Next.js app, routes, UI components, and client/server data helpers
packages/
  shared/    Shared schemas, types, and constants
scripts/     Project scripts used by local database and Prisma commands
```

## Notes

- Keep PostgreSQL and Redis running while using the app locally.
- If TMDB credentials are missing or TMDB is unavailable, parts of the interface may fall back to local demo data.
- Password reset currently logs a development token when enabled. Keep `PASSWORD_RESET_TOKEN_LOGGING_ENABLED=false` outside local development.
