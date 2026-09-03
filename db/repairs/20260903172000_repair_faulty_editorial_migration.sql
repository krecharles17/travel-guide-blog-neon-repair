-- ============================================================================
-- 20260903172000_repair_faulty_editorial_migration.sql  (KNOWN-GOOD REPAIR)
-- ============================================================================
-- Reverses 20260903171000_faulty_editorial_migration.sql using ONLY recorded
-- evidence — no hardcoded correct values:
--
--   * Which rows were touched        -> migration_audit.details of the faulty
--                                       migration (affected_*_ids arrays).
--   * Canonical article facts        -> editorial_revisions, latest
--                                       revision_no per affected article.
--   * Canonical route stop order     -> route_stop_history, latest row per
--                                       stop (the faulty migration never
--                                       journaled its rewrite, so the journal
--                                       still holds the published order).
--
-- Transactional and idempotent: safe to run multiple times. Engagement data
-- (article_likes, article_comments, newsletter_subscribers) and view counts
-- are never touched.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Step 1: park the affected stops away from 1..N so renumbering cannot collide
-- with the (route_id, stop_number) unique constraint.
-- ---------------------------------------------------------------------------
WITH faulty AS (
  SELECT jsonb_array_elements_text(details->'affected_route_ids') AS route_id
  FROM migration_audit
  WHERE migration_name = '20260903171000_faulty_editorial_migration.sql'
)
UPDATE route_stops
SET stop_number = stop_number + 1000
WHERE route_id IN (SELECT route_id FROM faulty)
  AND stop_number <= 1000;

-- ---------------------------------------------------------------------------
-- Step 2: restore article country / status / featured from the latest
-- editorial revision of each affected article.
-- ---------------------------------------------------------------------------
WITH faulty AS (
  SELECT jsonb_array_elements_text(details->'affected_article_ids') AS article_id
  FROM migration_audit
  WHERE migration_name = '20260903171000_faulty_editorial_migration.sql'
), latest_revision AS (
  SELECT DISTINCT ON (er.article_id)
         er.article_id, er.country_id, er.status, er.is_featured
  FROM editorial_revisions er
  WHERE er.article_id IN (SELECT article_id FROM faulty)
  ORDER BY er.article_id, er.revision_no DESC, er.created_at DESC
)
UPDATE articles a
SET country_id  = lr.country_id,
    status      = lr.status,
    is_featured = lr.is_featured
FROM latest_revision lr
WHERE a.id = lr.article_id
  AND (a.country_id IS DISTINCT FROM lr.country_id
       OR a.status IS DISTINCT FROM lr.status
       OR a.is_featured IS DISTINCT FROM lr.is_featured);

-- ---------------------------------------------------------------------------
-- Step 3: restore canonical stop numbers from the stop journal (latest row
-- per stop). Stops currently sit at 1001+, so 1..N cannot collide.
-- ---------------------------------------------------------------------------
WITH faulty AS (
  SELECT jsonb_array_elements_text(details->'affected_route_ids') AS route_id
  FROM migration_audit
  WHERE migration_name = '20260903171000_faulty_editorial_migration.sql'
), canonical_stop AS (
  SELECT DISTINCT ON (h.stop_id)
         h.stop_id, h.route_id, h.new_stop_number
  FROM route_stop_history h
  WHERE h.route_id IN (SELECT route_id FROM faulty)
  ORDER BY h.stop_id, h.created_at DESC, h.id DESC
)
UPDATE route_stops rs
SET stop_number = cs.new_stop_number
FROM canonical_stop cs
WHERE rs.id = cs.stop_id
  AND rs.stop_number <> cs.new_stop_number;

-- ---------------------------------------------------------------------------
-- Step 4: audit the repair itself and flag the faulty migration.
-- ---------------------------------------------------------------------------
INSERT INTO migration_audit (migration_name, description, applied_by, status, details)
VALUES (
  '20260903172000_repair_faulty_editorial_migration.sql',
  'Repair: restore article assignments/publication state from editorial_revisions and route stop order from route_stop_history for rows touched by the faulty editorial migration.',
  'repair-pipeline',
  'applied',
  '{"repairs_from_evidence": ["migration_audit.details", "editorial_revisions", "route_stop_history"]}'::jsonb
)
ON CONFLICT (migration_name) DO NOTHING;

UPDATE migration_audit
SET status = 'flagged'
WHERE migration_name = '20260903171000_faulty_editorial_migration.sql'
  AND status = 'applied';

COMMIT;
