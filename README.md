# BuzzShot

BuzzShot is a social discovery platform for movies and series. It helps people find what to watch next, keep track of what they care about, and build a taste graph around reviews, ratings, lists, follows, and recommendations.

The app is built around TMDB-powered discovery, but all TMDB traffic stays behind the API. Users can browse movies and shows, search across media, open rich detail pages, rate and review titles, manage watchlists and favorites, publish custom lists, follow other people, read activity feeds, and get personalized picks with clear reasons.

## Stack

BuzzShot is a TypeScript monorepo managed with `pnpm`.

- `apps/web`: Next.js App Router, React, Tailwind CSS, TanStack Query, React Hook Form, Zod, Vitest, and Playwright.
- `apps/api`: NestJS, Prisma, PostgreSQL, Redis, JWT access tokens, HttpOnly refresh-token cookies, Helmet, CORS, and Zod-based environment validation.
- `packages/shared`: shared types, schemas, and constants used by the web and API apps.
- Local infrastructure: Docker Compose with PostgreSQL 16 and Redis 7.

## Requirements

Install these before running the project:

- Node.js `22` or newer.
- `pnpm` `10` or newer. The project was generated with `pnpm@11.1.3`.
- Docker and Docker Compose for PostgreSQL and Redis.
- A TMDB API Read Access Token for live movie and series data.
- Optional Google OAuth credentials if you want Google sign-in.

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create your local environment file:

```bash
cp .env.example .env
```

At minimum, update these values in `.env`:

```bash
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
TMDB_READ_ACCESS_TOKEN=your-tmdb-read-access-token
```

Start PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
```

Run Prisma migrations and seed the database:

```bash
pnpm db:migrate
pnpm db:seed
```

Start the web and API apps:

```bash
pnpm dev
```

The web app runs at `http://localhost:3000`.
The API runs at `http://localhost:4000/api`.

## Docker Setup

To run the full local stack with Docker:

```bash
cp .env.example .env
docker compose up --build
```

Docker Compose starts:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

The API container runs Prisma migrations before it starts. PostgreSQL, Redis, and API storage use named Docker volumes so data survives container restarts.

## Environment Variables

Important variables are documented in `.env.example`.

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `REDIS_URL`: Redis connection string used for API caching.
- `JWT_ACCESS_SECRET`: high-entropy secret for signing access tokens.
- `JWT_ACCESS_ISSUER` and `JWT_ACCESS_AUDIENCE`: JWT validation metadata.
- `REFRESH_TOKEN_COOKIE_NAME` and `REFRESH_TOKEN_TTL_DAYS`: refresh-session cookie settings.
- `COOKIE_SECURE`: set to `true` in production behind HTTPS.
- `NEXT_PUBLIC_API_URL`: browser-facing API URL used by the web app.
- `INTERNAL_API_URL`: server-side API URL used by the Next.js app when running in Docker.
- `API_URL` and `WEB_URL`: public API and web origins used by the backend.
- `TMDB_READ_ACCESS_TOKEN`: preferred TMDB credential for live media data.
- `TMDB_API_KEY`: optional fallback TMDB credential.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL`: optional Google OAuth configuration.

Never expose TMDB credentials through `NEXT_PUBLIC_*` variables. The frontend talks to BuzzShot's API, and the API talks to TMDB.

## Self-Hosting Notes

For a production deployment, use managed PostgreSQL and a managed Redis service when possible. Build and run the web and API apps as separate services, then point both at the same production environment values.

Recommended production settings:

```bash
NODE_ENV=production
COOKIE_SECURE=true
PASSWORD_RESET_TOKEN_LOGGING_ENABLED=false
JWT_ACCESS_SECRET=<long-random-secret>
API_URL=https://api.your-domain.com
WEB_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```

Run database migrations during deployment:

```bash
pnpm db:deploy
```

Then start the services:

```bash
pnpm --filter api start
pnpm --filter web start
```

If you deploy with Docker, build from the included `apps/api/Dockerfile` and `apps/web/Dockerfile`. The web image needs `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL` available as build args, because Next.js bakes public variables into the client bundle.

After deployment, verify:

```bash
curl https://api.your-domain.com/api/health
```

## Quality Checks

Run these before opening a pull request or deploying:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter web test:e2e
```

Playwright may need browser binaries installed locally:

```bash
pnpm --filter web exec playwright install
```
