# BuzzShot V2 Changes

This file documents intentional implementation choices and deviations from `.agents/PLANS.md`.

## 2026-05-20

- Started from an empty workspace with no valid Git history, so the V2 implementation is a true greenfield monorepo bootstrap.
- Added a root `PLANS.md` that points to `.agents/PLANS.md` instead of duplicating the full plan, keeping one canonical source of truth.
- Web pages include API-backed data loading with local demo fallbacks so the interface remains reviewable before TMDB credentials and the API server are configured.
- UI uses shadcn-inspired local primitives instead of installing generated shadcn component files; this keeps the design system small while preserving the intended component behavior and styling conventions.
- Media and search API routes now call TMDB server-side using `TMDB_READ_ACCESS_TOKEN` with `TMDB_API_KEY` fallback. Demo data remains as a resilience fallback if TMDB is unavailable or credentials are missing.
- TMDB integration covers configuration, genres, trending, popular/top-rated/now-playing/upcoming movies, popular/top-rated/airing-today series, multi-search, and rich movie/series details using appended credits, videos, similar titles, and recommendations.
- Full persistent CRUD and production refresh-token storage remain the next backend hardening step.
- Playwright E2E is configured, but local execution is blocked on this Ubuntu 26.04 image because Playwright does not currently provide a Chromium binary for it.
- Local Docker infrastructure is defined and verified with healthy PostgreSQL and Redis containers after pulling images explicitly.
- Frontend quality pass added a skip link, image-domain preconnect, explicit image dimensions/fetch priority, focus-visible rings, input autocomplete/name attributes, and dark-theme native input styling.
- Docker Compose now runs the full local app stack: Next.js web, NestJS API, PostgreSQL, and Redis, with named volumes for persistent database/cache data and future API file storage.

## 2026-05-21

- Replaced demo in-memory auth with Prisma-backed email/password auth, Google OAuth account linking, hashed refresh-token persistence, rotation, and revocation.
- Login and register pages now submit to the API, keep access tokens in client memory, rely on HttpOnly refresh cookies, and gate private web routes when no refresh cookie is present.
- Added explicit API auth guards, validated DTOs, Prisma-backed ratings, reviews, review likes/comments, watchlist, watched, favorites, follows, feed, custom lists, grouped search, and recommendation snapshots.
- TMDB cache now checks Redis first, then persisted `MediaCache`, then TMDB, and writes fresh responses back to both caches.
- Password reset uses a development-safe server log token instead of an email provider; wiring SMTP or a transactional email service remains a deployment choice.
- Account settings expose email and username as read-only in v1 until verification-backed edit flows are added.
- Local Docker Compose keeps `NODE_ENV` configurable and defaults it to development so local startup is not blocked by production secret validation.
- Custom lists now support follows, list-follower notifications for new additions, list likes/comments in the UI, searchable add/remove flows, and per-title add/remove controls on media detail pages.
- Added a protected notifications page that combines stored notifications with activity from followed people and followed lists.
- Profile pages now expose public watched and favorites collections, keep watchlists visible only to their owner as a private section, and keep list deletion behind owner-only API and UI checks.
- Media details now include horizontal clickable cast, producer/creator, and crew rows, TMDB still galleries, and first-class TMDB-backed person profile pages with known-for credits.
- Reviews now require an explicit rating while allowing optional written text, and review submission also syncs the standalone rating record.
- Profile settings now support avatar images through validated HTTPS image URLs or resized local image uploads stored as bounded data images.
