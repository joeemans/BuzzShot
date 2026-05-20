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
