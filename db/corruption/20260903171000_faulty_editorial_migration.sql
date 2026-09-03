-- ============================================================================
-- 20260903171000_faulty_editorial_migration.sql  (INTENTIONALLY CORRUPTING)
-- ============================================================================
-- Scenario: an over-eager editorial "coverage refresh" migration was written
-- by hand and applied outside the normal review process. It:
--
--   1. Reassigns 8 articles to the WRONG countries (all cross-continent).
--   2. Flips publication status (published -> draft/archived) on those rows
--      and wrongly promotes two articles to "featured".
--   3. Rotates the stop ordering of two routes (rt-0007, rt-0023) by writing
--      straight to route_stops.stop_number, bypassing route_stop_history.
--
-- The migration DOES log itself to migration_audit (that habit was hard-coded
-- in the tooling), including the ids it touched — which is exactly what makes
-- the damage reversible: canonical values live in editorial_revisions
-- (per-article) and route_stop_history (per-stop).
--
-- Engagement data (likes, comments, subscribers, view counts) is untouched.
-- The script is idempotent and safe to re-run for demos.
-- ============================================================================

BEGIN;

-- Audit trail: the faulty migration logs what it (thinks it) did.
INSERT INTO migration_audit (migration_name, description, applied_by, status, details)
VALUES (
  '20260903171000_faulty_editorial_migration.sql',
  'Bulk editorial coverage refresh: re-scope articles to broader regions and refresh route ordering. Applied without review.',
  'editor-bot',
  'applied',
  '{
    "affected_article_ids": ["art-fr-001","art-jp-002","art-pe-004","art-ke-001","art-au-002","art-mx-005","art-is-001","art-br-006"],
    "affected_route_ids": ["rt-0007","rt-0023"],
    "rollback_hint": "Canonical article facts: editorial_revisions (latest revision_no per article). Canonical stop order: route_stop_history (latest row per stop)."
  }'::jsonb
)
ON CONFLICT (migration_name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1+2. Articles moved to wrong countries/continents, status flipped,
--      two wrongly promoted to featured. Cross-continent on purpose so the
--      corruption is obvious in the destination tree.
-- ---------------------------------------------------------------------------
UPDATE articles SET
  country_id  = (SELECT id FROM countries WHERE slug = 'peru'),
  status      = 'draft',
  is_featured = false
WHERE id = 'art-fr-001';          -- was: France (Europe)

UPDATE articles SET
  country_id  = (SELECT id FROM countries WHERE slug = 'kenya'),
  status      = 'archived',
  is_featured = false
WHERE id = 'art-jp-002';          -- was: Japan (Asia)

UPDATE articles SET
  country_id  = (SELECT id FROM countries WHERE slug = 'france'),
  status      = 'draft',
  is_featured = false
WHERE id = 'art-pe-004';          -- was: Peru (South America)

UPDATE articles SET
  country_id  = (SELECT id FROM countries WHERE slug = 'japan'),
  status      = 'published',
  is_featured = true
WHERE id = 'art-ke-001';          -- was: Kenya (Africa) — wrongly promoted

UPDATE articles SET
  country_id  = (SELECT id FROM countries WHERE slug = 'iceland'),
  status      = 'draft',
  is_featured = false
WHERE id = 'art-au-002';          -- was: Australia (Oceania)

UPDATE articles SET
  country_id  = (SELECT id FROM countries WHERE slug = 'thailand'),
  status      = 'published',
  is_featured = true
WHERE id = 'art-mx-005';          -- was: Mexico (North America) — wrongly promoted

UPDATE articles SET
  country_id  = (SELECT id FROM countries WHERE slug = 'australia'),
  status      = 'archived',
  is_featured = false
WHERE id = 'art-is-001';          -- was: Iceland (Europe)

UPDATE articles SET
  country_id  = (SELECT id FROM countries WHERE slug = 'nepal'),
  status      = 'draft',
  is_featured = false
WHERE id = 'art-br-006';          -- was: Brazil (South America)

-- ---------------------------------------------------------------------------
-- 3. Damage two route orderings: rotate stops forward by one, bypassing
--    route_stop_history. Offset trick avoids the (route_id, stop_number)
--    unique constraint while the values are in flight.
-- ---------------------------------------------------------------------------
UPDATE route_stops
SET stop_number = stop_number + 1000
WHERE route_id IN ('rt-0007', 'rt-0023');

UPDATE route_stops rs
SET stop_number = ((rs.stop_number - 1000) % c.n) + 1
FROM (
  SELECT route_id, COUNT(*)::int AS n
  FROM route_stops
  WHERE route_id IN ('rt-0007', 'rt-0023')
  GROUP BY route_id
) c
WHERE rs.route_id = c.route_id;

COMMIT;
