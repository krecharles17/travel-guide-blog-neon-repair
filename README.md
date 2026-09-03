# Wanderlust — Editorial Travel Blog & Digital Shop (Neon PostgreSQL edition)

Vite + React + shadcn/ui travel blog backed by **Neon PostgreSQL** through a
minimal server-side API. The browser never talks to the database.

## Architecture

```
Browser (Vite SPA)
  │  fetch /api/…            ← no DATABASE_URL, no Supabase, no DB driver in the bundle
  ▼
Express API (server/)        ← the only place DATABASE_URL is read
  │  @neondatabase/serverless (neon-http) when host is *.neon.tech
  │  pg (node-postgres) otherwise (local dev, CI, self-hosted)
  ▼
Neon PostgreSQL / any Postgres
```

| Piece | Location | Notes |
| --- | --- | --- |
| Express app (routes only) | `server/app.ts` | exported as `createApp(db)` for tests |
| Server entrypoint | `server/index.ts` | API + static `dist/` in production |
| Driver selection | `server/db.ts` | `neon-http` for Neon, `pg` for everything else |
| Frontend API client | `src/lib/api.ts` | throws `ApiError` with HTTP status + Postgres code |
| Content/engagement hooks | `src/hooks/useContent.ts` | same API as before, now fetch-based |
| Canonical schema | `db/sql/schema.sql` | plain Postgres, no RLS/anon grants |
| Deterministic seed | `db/seed/` | fixed UUIDv5 ids, no randomness |
| Corruption / repair / verify | `db/corruption/`, `db/repairs/`, `db/verify/` | SQL artifacts + TS verifier |

### API surface

| Method & path | Purpose |
| --- | --- |
| `GET /api/health` | liveness probe |
| `GET /api/destinations` | continent → country → article tree (featured articles excluded, as before) |
| `GET /api/articles?filter=featured` | featured list |
| `GET /api/articles?filter=popular&limit=N` | most-read (view counter) |
| `GET /api/articles/:id` | full article incl. body |
| `POST /api/articles/:id/views` | atomic view increment |
| `GET/POST/DELETE /api/articles/:id/likes` | one like per anonymous visitor id |
| `GET/POST /api/articles/:id/comments` | newest-first list, validated inserts |
| `POST /api/newsletter` | subscribe (duplicate → `409` with `code: "23505"`) |
| `GET /api/routes`, `GET /api/products` | routes and shop catalog |

All article, route and product behaviour, routes (`/`, `/destinations`,
`/destinations/:continent/:country`, `/article/:articleId`, `/routes`,
`/routes/:routeId`, `/shop`, `/shop/:productId`) and page components are
unchanged. The old Supabase client (`src/integrations/supabase/`), the
`@supabase/supabase-js` dependency and all Supabase runtime files
(`config.toml`, `functions/`) were removed; the historical Supabase
migrations in `supabase/migrations/` are kept as provenance for the schema.

## Database schema

Inferred from the app's hooks and the original Supabase migrations, plus
editorial-governance tables used by the repair scenario:

* `continents`, `countries` — geographic tree (as before)
* `articles` — as before **plus** `status` (`draft`/`published`/`archived`)
* `travel_routes`, `products` — as before
* `article_likes`, `article_comments`, `newsletter_subscribers` — engagement (as before)
* `editorial_revisions` — **canonical per-article facts** (country, status,
  featured) recorded by the editorial workflow; latest `revision_no` wins
* `route_stops` — ordered stops per route (`UNIQUE (route_id, stop_number)`)
* `route_stop_history` — append-only journal of legitimate stop reorderings
* `migration_audit` — append-only record of applied migrations (name, status,
  details JSONB, including ids touched by bulk migrations)

## Setup

```sh
npm install
cp .env.example .env
# edit .env → set DATABASE_URL (Neon connection string or local Postgres)
```

**DATABASE_URL is server-side only.** Never prefix it with `VITE_`; anything
Vite sees is bundled into the browser and published. With Neon, use the
pooled connection string and keep `?sslmode=require`.

### Run locally

```sh
npm run dev:server   # Express API on :8787 (reads DATABASE_URL)
npm run dev          # Vite on :8080, /api proxied to :8787
```

### Run in production shape

```sh
npm run start        # builds dist/ and serves it + the API on :8787
```

## Deterministic seed data

`npm run db:seed` **drops and recreates** the Wanderlust tables in the target
schema (default `public`, override with `DB_SCHEMA`) and reseeds:

| Table | Rows | Notes |
| --- | --- | --- |
| continents | 6 | Europe, Asia, Africa, North & South America, Oceania |
| countries | 60 | 10 per continent, real regions/phrases/best-months |
| articles | 360 | 6 per country; 6 featured, 20 scheduled drafts, rest published/archived |
| editorial_revisions | 372 | rev 1 per article + 12 approved same-continent moves (rev 2) |
| travel_routes | 40 | themes × continents, full itinerary JSONB |
| route_stops | 199 | 4–6 ordered stops per route |
| route_stop_history | 199 | journal row per stop (canonical order evidence) |
| products | 100 | guidebooks with pricing/ratings/chapters |
| article_likes | 5,876 | deterministic visitor likes (like_count trigger-synced) |
| article_comments | 1,010 | deterministic, realistic bodies |
| newsletter_subscribers | 150 | inline/hero/split signup sources |
| migration_audit | 3 | baseline + governance + seed audit rows |

Seeding is fully deterministic: UUIDv5 ids, fixed author/name pools, hashed
view counts. Re-running produces byte-identical content (new random UUIDs only
for like/comment/subscriber rows).

## The corrupted-editorial-migration scenario (repair demo)

```sh
npm run db:seed      # canonical state
npm run db:verify    # PASS
npm run db:corrupt   # applies the faulty migration
npm run db:verify    # FAIL (violations printed)
npm run db:repair    # evidence-driven, transactional repair
npm run db:verify    # PASS again
```

**The fault** — `db/corruption/20260903171000_faulty_editorial_migration.sql`
simulates a hand-written "coverage refresh" migration applied without review.
It (1) reassigns 8 articles to the wrong countries — every one cross-continent
(e.g. `art-fr-001` France → Peru), (2) flips publication status
(`published → draft/archived`) and wrongly promotes two articles to featured,
and (3) rotates the stop ordering of routes `rt-0007` and `rt-0023` by writing
straight to `route_stops.stop_number`, bypassing the journal. It does log
itself to `migration_audit` (with the ids it touched), and it never touches
engagement data.

**The evidence trail** — correct values are inferable without hardcoding:

* *which rows* → `migration_audit.details` of the faulty migration
  (`affected_article_ids`, `affected_route_ids`)
* *canonical article facts* → `editorial_revisions`, latest `revision_no`
  per article
* *canonical route order* → `route_stop_history`, latest row per stop
  (the faulty migration skipped the journal, so the journal still holds the
  published order)

**The verifier** — `db/verify.ts` (SQL twin: `db/verify/verify_integrity.sql`)
checks: article ↔ latest-revision agreement; stop ↔ latest-journal agreement;
stop sequences contiguous `1..N`; `like_count` ↔ like rows; non-empty tables.
Note the sequence check alone cannot catch the rotation (a rotation keeps
`1..N` contiguous) — the journal check is what detects it.

**The repair** — `db/repairs/20260903172000_repair_faulty_editorial_migration.sql`
runs in one transaction, derives affected ids from `migration_audit.details`,
restores articles from revisions and stop numbers from the journal, records its
own audit row, flags the faulty migration `flagged`. It is idempotent and never
touches engagement data.

## Tests

```sh
npm test             # unit tests + DB-backed suites (DB suites skip without DATABASE_URL)
npm run test:db      # schema tests + API integration tests
npm run test:repair  # repair artifact/contract checks + VERIFIED REPAIR integration
npm run lint
npm run build
```

* `src/test/*` — browser-side unit tests (jsdom, always run)
* `tests/db/schema.test.ts` — constraints, trigger, view counter, cascades
* `tests/api/api.test.ts` — full API surface against an isolated schema
* `tests/repair/verified-repair.test.ts` — two layers, see below

No Docker, no local provisioning: DB-backed suites create a throwaway Postgres
**schema** per run (search_path scoped) on anything reachable via
`DATABASE_URL` — a Neon branch, a local Postgres, a CI service container.
When `DATABASE_URL` is unset, DB-backed suites are reported as skipped (the
reason is part of the suite name); unit tests, lint and build run regardless.

`test:repair` runs two layers:

* **Offline (always, no database, < 1 s)** — deterministic artifact/contract
  checks: the seed builds byte-identical with the documented row counts, the
  8 corrupted articles have the documented canonical facts, the corruption/
  repair SQL pins exactly the expected ids and stays transactional,
  idempotent and out of engagement tables, verifier rules match their SQL
  twin, and `src/` leaks no `DATABASE_URL`/Supabase references.
* **Integration (only when `DATABASE_URL` is set)** — the full scenario below
  on the isolated database; otherwise reported as
  `VERIFIED REPAIR integration — SKIPPED (DATABASE_URL not set)` and the run
  still passes.

The repair test proves, on the isolated database:

1. canonical seed → verifier **PASS**, fingerprints captured
2. corruption applied → verifier **FAIL** with exactly 8 article/revision
   mismatches + all stops of both routes mismatching their journal; engagement,
   geography and shop fingerprints unchanged
3. repair applied → verifier **PASS**, articles/routes back to canonical,
   all four fingerprint domains equal the canonical capture, faulty migration
   flagged + repair audited
4. repair re-applied twice → still canonical (idempotency)

## Security notes

* `DATABASE_URL` is read only in `server/*` and `db/*` — never in `src/`, never
  with a `VITE_` prefix, never logged.
* The browser bundle contains no DB driver and no credentials; the API is the
  only ingress and validates/limits every mutation (comment length bounds,
  email format, one like per visitor, JSON body size cap).
* The old Supabase RLS policies/anon grants are intentionally gone: the API
  connects as the app's own role. If you expose the database to other users,
  create a least-privilege role (no `CREATE`, no `DROP`) and use it in
  `DATABASE_URL`.
* Historical Supabase credentials (`VITE_SUPABASE_*`) are gone; `.env` is
  gitignored and ships with placeholders only.
